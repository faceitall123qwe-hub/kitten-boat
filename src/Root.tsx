import { Composition } from "remotion";
import { KittenBoat } from "./KittenBoat";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="KittenBoat"
      component={KittenBoat}
      durationInFrames={555}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
