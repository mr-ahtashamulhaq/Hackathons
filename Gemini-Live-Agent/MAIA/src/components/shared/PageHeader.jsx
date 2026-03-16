import React from 'react';

export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 rounded-2xl bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && action}
      </div>
    </div>
  );
}