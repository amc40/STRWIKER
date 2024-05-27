'use client';
import React, { PropsWithChildren } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

export const StatsSwiper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Swiper
      centeredSlides={true}
      modules={[Pagination, Autoplay, A11y]}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: true,
        stopOnLastSlide: true,
      }}
    >
      {React.Children.map(children, (child) => {
        // Ensure `child` is a valid React element before wrapping
        if (React.isValidElement(child)) {
          return <SwiperSlide>{child}</SwiperSlide>;
        }
        return child;
      })}
    </Swiper>
  );
};
