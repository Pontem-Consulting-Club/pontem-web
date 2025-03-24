'use client';
import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useMotionValue, animate, motion } from 'framer-motion';
import useMeasure from 'react-use-measure';

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width }] = useMeasure();
  const translation = useMotionValue(0);
  const [, setIsTransitioning] = useState(false);
  const logoRefs = useRef([]);

  // Duplicamos los children para crear el efecto de carrusel infinito
  const resizedChildren = React.Children.map(children, (child, index) =>
    React.cloneElement(child, {
      ref: (el) => (logoRefs.current[index] = el),
      style: {
        ...child.props.style,
        marginRight: `${gap}px`,
        marginTop: `${gap / 4}px`,
        marginBottom: `${gap / 4}px`,
      },
    })
  );

  useEffect(() => {
    let controls;
    if (width > 0) {
      // Calcula el ancho total de los logos
      const totalLogoWidth = logoRefs.current.reduce((acc, logo) => acc + (logo?.offsetWidth || 0), 0);
      const contentSize = totalLogoWidth + gap * resizedChildren.length;
      const from = reverse ? -contentSize : 0;
      const to = reverse ? 0 : -contentSize;

      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: (currentDuration * contentSize) / 2000,
        repeat: Infinity,
        repeatType: 'loop',
      });
    }

    return () => controls?.stop();
  }, [translation, currentDuration, width, gap, reverse, resizedChildren.length]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  return (
    <div
      className={classNames('overflow-hidden', className)}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
    >
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          flexDirection: 'row',
          whiteSpace: 'nowrap',
        }}
        ref={ref}
        {...hoverProps}
      >
        {resizedChildren}
        {resizedChildren}
        {resizedChildren}
      </motion.div>
    </div>
  );
}