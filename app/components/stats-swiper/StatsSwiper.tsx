'use client';
import React, { PropsWithChildren } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

// As of March 2024 there isn't a way to wrap async Server children in another component.
// This isn't ideal as all of the children manually have to be wrapped in <SwiperSlide>s
export const StatsSwiper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Swiper
      centeredSlides={true}
      modules={[Pagination, Autoplay, A11y]}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
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
