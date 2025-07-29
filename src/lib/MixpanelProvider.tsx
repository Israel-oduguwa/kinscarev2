"use client"
import { useEffect, FC } from "react";
import { initMixpanel } from "./mixpanel";

const MixpanelProvider: FC = () => {
  useEffect(() => {
    initMixpanel();
  }, []);
  return null;
};

export default MixpanelProvider;
