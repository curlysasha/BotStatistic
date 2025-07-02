"use client";

import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(startValue);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const targetValue = direction === "down" ? startValue : value;
      const currentValue = direction === "down" ? value : startValue;
      const difference = targetValue - currentValue;
      const duration = 1500; // 1.5 seconds
      const steps = 60; // 60 steps for smooth animation
      const increment = difference / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newValue = currentValue + (increment * currentStep);
        
        if (currentStep >= steps) {
          setDisplayValue(targetValue);
          clearInterval(interval);
        } else {
          setDisplayValue(newValue);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isVisible, value, startValue, direction, delay]);

  const formattedValue = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(displayValue.toFixed(decimalPlaces)));

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-wider text-black dark:text-white transition-all duration-300",
        className,
      )}
      {...props}
    >
      {formattedValue}
    </span>
  );
}