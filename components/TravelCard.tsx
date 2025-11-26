import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TravelCardProps } from '@/lib/types';

export default function TravelCard({ plan, index }: TravelCardProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: plan.budget.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date range
  const formatDateRange = () => {
    const start = new Date(plan.duration.startDate);
    const end = new Date(plan.duration.endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <Card className="w-full hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] fade-in border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📍</span>
              <CardTitle className="text-xl sm:text-2xl leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
                {plan.destination}
              </CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base font-medium text-foreground/70">
              {plan.country}
            </CardDescription>
          </div>
          <div className="text-left sm:text-right sm:ml-4 flex sm:flex-col gap-2 sm:gap-0 items-center sm:items-end bg-accent/20 rounded-xl px-4 py-2 border border-accent/30">
            <div className="text-xl sm:text-2xl font-bold text-accent-foreground">
              {formatCurrency(plan.budget.estimated)}
            </div>
            <div className="text-xs sm:text-sm text-foreground/70 font-semibold">
              {plan.duration.hours 
                ? `${plan.duration.hours} ${plan.duration.hours === 1 ? 'hour' : 'hours'}`
                : plan.duration.nights === 0 
                  ? 'Day Trip' 
                  : `${plan.duration.nights} ${plan.duration.nights === 1 ? 'night' : 'nights'}`
              }
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/70 mt-2 font-medium">
          <span>📅</span>
          {formatDateRange()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Key Attractions */}
        {plan.highlights && plan.highlights.length > 0 && (
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <h4 className="font-bold text-sm mb-3 text-primary flex items-center gap-2">
              <span>📍</span>
              Key Attractions
            </h4>
            <ul className="space-y-2">
              {plan.highlights.map((highlight, idx) => (
                <li key={idx} className="text-sm text-foreground/80 flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Things to Do */}
        {plan.activities && plan.activities.length > 0 && (
          <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/20">
            <h4 className="font-bold text-sm mb-3 text-secondary flex items-center gap-2">
              <span>🎯</span>
              Things to Do
            </h4>
            <ul className="space-y-2">
              {plan.activities.map((activity, idx) => (
                <li key={idx} className="text-sm text-foreground/80 flex items-start">
                  <span className="mr-2 text-secondary">•</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Budget Breakdown */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-foreground">Budget Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {plan.budget.breakdown.admission !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admission:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.admission)}</span>
              </div>
            )}
            {plan.budget.breakdown.activities !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activities:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.activities)}</span>
              </div>
            )}
            {plan.budget.breakdown.food !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Food:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.food)}</span>
              </div>
            )}
            {plan.budget.breakdown.transportation !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transport:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.transportation)}</span>
              </div>
            )}
            {/* Legacy fields for backward compatibility */}
            {plan.budget.breakdown.flights !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flights:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.flights)}</span>
              </div>
            )}
            {plan.budget.breakdown.accommodation !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accommodation:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.accommodation)}</span>
              </div>
            )}
            {plan.budget.breakdown.other !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other:</span>
                <span className="font-medium">{formatCurrency(plan.budget.breakdown.other)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Accommodation */}
        {plan.accommodation && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Accommodation</h4>
            <div className="text-sm">
              <div className="font-medium text-foreground mb-1">{plan.accommodation.type}</div>
              <div className="text-muted-foreground">{plan.accommodation.description}</div>
            </div>
          </div>
        )}

        {/* Transportation */}
        {plan.transportation && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Transportation</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-start">
                <span className="text-muted-foreground min-w-[80px]">Arrival:</span>
                <span className="text-foreground">{plan.transportation.arrival}</span>
              </div>
              <div className="flex items-start">
                <span className="text-muted-foreground min-w-[80px]">Local:</span>
                <span className="text-foreground">{plan.transportation.local}</span>
              </div>
            </div>
          </div>
        )}

        {/* Best For */}
        {plan.bestFor && plan.bestFor.length > 0 && (
          <div>
            <h4 className="font-bold text-sm mb-3 text-foreground flex items-center gap-2">
              <span>👥</span>
              Best For
            </h4>
            <div className="flex flex-wrap gap-2">
              {plan.bestFor.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Considerations */}
        {plan.considerations && plan.considerations.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Considerations</h4>
            <ul className="space-y-1">
              {plan.considerations.map((consideration, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start">
                  <span className="mr-2">•</span>
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
