import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

interface WrapChildrenInSwiperIfMobileProps {
  isMobile: boolean;
}

export const WrapChildrenInSwiperIfMobile: React.FC<
  React.PropsWithChildren<WrapChildrenInSwiperIfMobileProps>
> = ({ isMobile, children }) => {
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Swiper>
      {React.Children.map(children, (child) => {
        return (
          <SwiperSlide>
            {' '}
            <div className="h-full flex">{child}</div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};
