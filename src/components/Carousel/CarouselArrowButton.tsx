import React, {
  ComponentPropsWithRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

type PropType = ComponentPropsWithRef<"button">;

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, "aria-label": ariaLabel, ...restProps } = props;

  return (
    <button
      className="embla__button embla__button--prev "
      type="button"
      aria-label={ariaLabel ?? "Previous slide"}
      {...restProps}
    >
      <div className="bg-blue-500 p-3 text-white rounded-full">
        <ChevronLeft size={25} />
      </div>

      {children}
    </button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, "aria-label": ariaLabel, ...restProps } = props;

  return (
    <button
      className="embla__button embla__button--next"
      type="button"
      aria-label={ariaLabel ?? "Next slide"}
      {...restProps}
    >
      <div className="bg-blue-500 p-3 text-white rounded-full">
      <ChevronRight size={25} />
      </div>
      
      {children}
    </button>
  );
};
