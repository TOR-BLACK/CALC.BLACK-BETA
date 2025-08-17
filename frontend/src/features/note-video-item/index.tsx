import axios from "axios";
import React, { useState } from "react";
import cnService from "services/cn";
import { NoteVideoType } from "types/notes";
import "./index.scss";

interface NoteVideItemProps {
  video: NoteVideoType;
  isBig?: boolean;
}

function NoteVideoItem(props: NoteVideItemProps) {
  const { video, isBig } = props;
  const { src } = video;
  const cn = cnService.createCn("note-video-item");
  const [loadCount, setLoadCount] = useState<number>(1);

  const handleVideoError = async (
    e: React.SyntheticEvent<HTMLVideoElement>,
    URL: string,
  ) => {
    const videoElement: HTMLVideoElement | null = e.currentTarget
      ? e.currentTarget
      : (e.target as HTMLSourceElement)?.closest("video");
    const reloadVideo = (withTimeout = false) => {
      if (loadCount < 5) {
        setTimeout(
          () => {
            videoElement?.load();
            setLoadCount((prevLoadCount) => prevLoadCount + 1);
          },
          withTimeout ? 1000 : 0,
        );
      }
    };

    try {
      const response = await axios.get(URL);

      if (response.status === 200) {
        reloadVideo();
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        reloadVideo(true);
      }
    }
  };

  return (
    <div className={cn("", { big: isBig })}>
      <video
        className={cn("video")}
        onError={(error) => {
          handleVideoError(error, src);
        }}
      >
        <source src={src} />
      </video>
    </div>
  );
}

export default NoteVideoItem;
