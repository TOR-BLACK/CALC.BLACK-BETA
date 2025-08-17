import { FilesApiService } from "api/files";
import { AxiosProgressEvent } from "axios";
import { LoadingIcon } from "components/icons/loading";
import { NOTIFICATION_TYPE } from "constants/notifications";
import notesHelper from "helpers/notes";
import React, { useEffect, useRef, useState } from "react";
import "./index.scss";
import apiService from "services/api";
import cnService from "services/cn";
import useStore from "store/hook";
import { ApiProgressType } from "types/api";
import { FileAddCoordsType } from "types/files";
import { NoteVideoType } from "types/notes";
import poster from "./poster.svg";

interface NoteVideoProps {
  video: NoteVideoType;
  disabled?: boolean;
  onUpdateCallback: (updates: Partial<NoteVideoType>) => void;
  onDeleteCallback?: () => void;
}

function NoteVideo(props: NoteVideoProps) {
  const cn = cnService.createCn("note-video");
  const { video, disabled, onUpdateCallback, onDeleteCallback } = props;
  const { name, src, file, coords, isProcessing, isError, isUploading } = video;
  const { addNotification } = useStore();

  const [withPoster, setWithPoster] = useState<boolean>(false);

  const [percent, setPercent] = useState<number>(0);
  const progressRef = useRef<ApiProgressType | null>(null);

  const handleProgress = (event: AxiosProgressEvent) => {
    const { percent: progressPercent } = apiService.progressHandler(
      event,
      progressRef.current as ApiProgressType,
    );

    setPercent(progressPercent);

    if (progressPercent >= 100) {
      onUpdateCallback({
        isUploading: false,
      });
    }
  };

  const stopProcessing = (withError: boolean = false) => {
    setPercent(0);
    onUpdateCallback({
      isProcessing: false,
      isUploading: false,
      isError: withError,
    });
  };

  const processVideo = async () => {
    /** Prepare video with coords */
    if (file && coords && !isProcessing) {
      progressRef.current = apiService.initProgress();
      progressRef.current?.reset();
      onUpdateCallback({
        isUploading: true,
        isProcessing: true,
      });

      try {
        const videoFormData: FileAddCoordsType =
          notesHelper.fileToAddCoords(video);

        /** Create video file with coords */
        const response = await FilesApiService.addCoords(
          videoFormData,
          handleProgress,
        );
        const fileURL: string = response.data;

        onUpdateCallback({
          src: fileURL,
          fileURL,
          file: undefined,
          coords: undefined,
        });
        stopProcessing();

        addNotification({
          title: name,
          text: "Видео успешно обработано",
          type: NOTIFICATION_TYPE.SUCCESS,
        });
      } catch (e) {
        console.log("error", e);
        addNotification({
          title: name,
          text: "Не удалось обработать видео ",
        });
        stopProcessing(true);
      }
    }
  };

  useEffect(() => {
    processVideo();
  }, []);

  return (
    <div className={cn()}>
      <div className={cn("video-block")}>
        {isProcessing && !isError && (
          <div className={cn("processing")}>
            <div className={cn("processing-text")}>
              Видео {isUploading ? "загружается" : "обрабатывается"}, подождите
            </div>
            {isUploading ? (
              <div className={cn("progress")}>
                <div
                  className={cn("progress-bar")}
                  style={{ width: `${percent}%` }}
                ></div>
                <div className={cn("progress-percent")}>{percent}%</div>
              </div>
            ) : (
              <LoadingIcon />
            )}
          </div>
        )}
        {isError && !isProcessing && (
          <div className={cn("error")}>
            Ошибка обработки видео.
            <br />
            Попробуйте загрузить заново.
          </div>
        )}
        {!(isError || isProcessing) && (
          <video
            className={cn("video")}
            poster={withPoster ? poster : ""}
          >
            <source src={src} />
          </video>
        )}
      </div>

      <div className={cn("name-wrapper")}>
        <div className={cn("name")}>{name}</div>
      </div>
      <button
        className={cn("delete")}
        type="button"
        disabled={disabled || isProcessing}
        onClick={onDeleteCallback}
      >
        Удалить
      </button>
    </div>
  );
}

export default NoteVideo;
