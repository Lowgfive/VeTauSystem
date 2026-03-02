import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  shortLabel?: string;
}

interface ProgressStepperProps {
  currentStep: number;
  steps: Step[];
}

export function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  return (
    <div className="w-full py-6 px-4 bg-white border-b shadow-sm">
      <div className="container mx-auto max-w-4xl">
        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-300 border-2
                      ${
                        isCompleted
                          ? 'bg-success border-success text-white shadow-md'
                          : isCurrent
                          ? 'bg-primary border-primary text-white shadow-lg scale-110'
                          : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div
                    className={`
                      mt-2 text-xs font-medium text-center whitespace-nowrap
                      ${isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-gray-500'}
                    `}
                  >
                    {step.label}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative top-[-12px]">
                    <div
                      className={`
                        h-full transition-all duration-500
                        ${isCompleted ? 'bg-success' : 'bg-gray-200'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Bước {currentStep} / {steps.length}
            </span>
            <span className="text-xs text-gray-500">
              {steps.find(s => s.id === currentStep)?.label}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Mini Steps Indicator */}
          <div className="flex gap-2 mt-3 justify-center">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div
                  key={step.id}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white scale-125'
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
