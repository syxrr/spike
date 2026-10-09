import { Composition } from 'remotion';
import { Showreel, ShowreelProps } from './Showreel';
import { TOTAL } from './timeline';

const FPS = 30;
const defaultProps: ShowreelProps = { showWasPrice: true, showPlaceholders: false };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 4K master: 3840×2160, 43s, seamless loop, no audio. */}
      <Composition
        id="HBTShowreel"
        component={Showreel}
        durationInFrames={Math.round(TOTAL * FPS)}
        fps={FPS}
        width={3840}
        height={2160}
        defaultProps={defaultProps}
      />
      {/* 1080p proxy for quick previews and test renders. */}
      <Composition
        id="HBTShowreel1080"
        component={Showreel}
        durationInFrames={Math.round(TOTAL * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
