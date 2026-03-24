
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

function getDateTime(date, timeStr) {
    const d = new Date(date);
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
}

async function debugChain() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const db = mongoose.connection.db;

    // Simulate search from HN to SG
    const depStation = await db.collection('stations').findOne({ station_code: 'HN' });
    const arrStation = await db.collection('stations').findOne({ station_code: 'SG' });
    
    console.log(`Searching from ${depStation.station_name} (${depStation.station_order}) to ${arrStation.station_name} (${arrStation.station_order})`);

    const stations = await db.collection('stations')
        .find({ station_order: { $gte: 1, $lte: 15 } })
        .sort({ station_order: 1 })
        .toArray();

    const segments = [];
    for (let i = 0; i < stations.length - 1; i++) {
        segments.push({
            departure_station_id: stations[i]._id,
            arrival_station_id: stations[i + 1]._id,
        });
    }

    const routes = await db.collection('routes').find({ $or: segments }).toArray();
    console.log(`Found ${routes.length} route segments`);

    const orderedRoutes = segments.map((segment) =>
        routes.find(
            (route) =>
            route.departure_station_id.toString() === segment.departure_station_id.toString() &&
            route.arrival_station_id.toString() === segment.arrival_station_id.toString()
        )
    );

    const routeIds = orderedRoutes.map(r => r._id.toString());
    const firstRouteId = routeIds[0];

    // Get train SE1
    const train = await db.collection('trains').findOne({ train_code: 'SE1' });

    // Date: 2026-03-26
    const searchDateStr = "2026-03-26";
    const [y, m, d] = searchDateStr.split("-").map(Number);
    const dayStart = new Date(y, m - 1, d);
    const queryStart = new Date(dayStart);
    queryStart.setDate(queryStart.getDate() - 1);
    
    // Search window
    const windowEnd = new Date(y, m - 1, d + 7);

    const schedules = await db.collection('schedules').find({
        train_id: train._id,
        route_id: { $in: orderedRoutes.map(r => r._id) },
        date: { $gte: queryStart, $lte: windowEnd }
    }).toArray();

    console.log(`Found ${schedules.length} schedules for SE1 in window`);

    const sortedSchedules = [...schedules].sort((a, b) => {
        return getDateTime(a.date, a.departure_time).getTime() - 
               getDateTime(b.date, b.departure_time).getTime();
    });

    const potentialFirstLegs = sortedSchedules.filter(s => {
        const sDate = new Date(s.date);
        return s.route_id.toString() === firstRouteId &&
               sDate.getFullYear() === y &&
               sDate.getMonth() === m - 1 &&
               sDate.getDate() === d;
    });

    console.log(`Found ${potentialFirstLegs.length} potential first legs`);

    for (const firstLeg of potentialFirstLegs) {
        console.log(`\nEvaluating first leg: Dep ${firstLeg.departure_time} Arr ${firstLeg.arrival_time}`);
        const currentJourney = [firstLeg];
        let lastArrival = getDateTime(firstLeg.date, firstLeg.arrival_time);

        let foundFullJourney = true;
        for (let i = 1; i < routeIds.length; i++) {
            const targetRouteId = routeIds[i];
            
            const nextLeg = sortedSchedules.find(s => 
                s.route_id.toString() === targetRouteId &&
                getDateTime(s.date, s.departure_time) >= lastArrival
            );

            if (nextLeg) {
                currentJourney.push(nextLeg);
                lastArrival = getDateTime(nextLeg.date, nextLeg.arrival_time);
                console.log(`  Leg ${i+1}: Route ${targetRouteId} | Dep ${nextLeg.departure_time} Arr ${nextLeg.arrival_time} | Found!`);
            } else {
                console.log(`  Leg ${i+1}: Route ${targetRouteId} | COULD NOT FIND NEXT LEG! `);
                console.log(`  Looking for departure >= ${lastArrival.toISOString()}`);
                
                // Let's print what schedules we DO have for this route
                const candidates = sortedSchedules.filter(s => s.route_id.toString() === targetRouteId);
                console.log(`  Available candidates for this route:`);
                candidates.forEach(c => {
                    console.log(`    Date: ${new Date(c.date).toISOString()}, Dep: ${c.departure_time}, Arr: ${c.arrival_time}, GetDateTime: ${getDateTime(c.date, c.departure_time).toISOString()}`);
                });

                foundFullJourney = false;
                break;
            }
        }

        if (foundFullJourney) {
            console.log("SUCCESS: Found full journey!");
        }
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

debugChain();
