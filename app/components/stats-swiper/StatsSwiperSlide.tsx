'use client';
import React, { PropsWithChildren } from 'react';
import { SwiperSlide } from 'swiper/react';

export const StatsSwiperSlide: React.FC<PropsWithChildren> = ({ children }) => {
  return <SwiperSlide>{children}</SwiperSlide>;
};
