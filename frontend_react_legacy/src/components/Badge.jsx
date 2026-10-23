import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const base = "inline-flex items-center font-medium rounded-full";
  
  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm"
  };

  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    published: "bg-green-100 text-green-800 border border-green-300 font-semibold",
    draft: "bg-slate-200 text-slate-800",
    under_review: "bg-amber-100 text-amber-800 border border-amber-300",
    verified_adopted: "bg-teal-100 text-teal-800 border border-teal-300 font-bold",
    testing: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};
