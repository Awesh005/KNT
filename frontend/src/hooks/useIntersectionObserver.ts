import { useState, useEffect, type RefObject } from 'react';

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px' },
  triggerOnce = true
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (triggerOnce) {
          observer.unobserve(element);
        }
      } else {
        if (!triggerOnce) {
          setIsIntersecting(false);
        }
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, triggerOnce, options.threshold, options.rootMargin, options.root]);

  return isIntersecting;
}
