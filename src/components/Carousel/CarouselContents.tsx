import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
// import { PrevButton, NextButton, usePrevNextButtons } from '';
import { PrevButton, NextButton, usePrevNextButtons } from './CarouselArrowButton';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay'

type PropType = {
  slides: React.ReactNode[]; // Accept any React node as slide content
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ playOnInit: true, delay: 3000 })
  ]);
//   const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla relative">
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slideContent, index) => (
            <div className="embla__slide flex-shrink-0 w-full" key={index}>
              {slideContent}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="embla__controls">
        <PrevButton
          className="absolute -left-10 top-1/2 transform -translate-y-1/2"
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
        />
        <NextButton
          className="absolute -right-10 top-1/2 transform -translate-y-1/2"
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
        />
      </div>

    
    </section>
  );
};

export default EmblaCarousel;
