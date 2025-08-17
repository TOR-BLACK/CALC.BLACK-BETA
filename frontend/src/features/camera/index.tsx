import { BackIcon } from "components/icons/back";
import { CloseIcon } from "components/icons/close";
import { LoadingIcon } from "components/icons/loading";
import { PhotoIcon } from "components/icons/photo";
import RadioButton from "components/radio-button";
import { COLOR } from "constants/colors";
import { LOCAL_STORAGE_KEY } from "constants/localStorage";
import { NOTIFICATION_TYPE } from "constants/notifications";
import { CameraPhotoType } from "features/camera/types";
import useGeolocation from "hooks/use-geolocation";
import { useStateRef } from "hooks/use-state-ref";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.scss";
import { isSafari } from "react-device-detect";
import Webcam from "react-webcam";
import { canvasService } from "services/canvas";
import cnService from "services/cn";
import fileService from "services/file";
import { localStorageService } from "services/localStorage";
import useStore from "store/hook";
import { PhotocamVideoConstraints } from "./constants";

interface CameraProps {
  isVideo?: boolean;
  withCoords?: boolean;
  onCaptureCallback: (file: File, coords?: string[]) => void;
  onCloseCallback: () => void;
}

function Camera(props: CameraProps) {
  const cn = cnService.createCn("camera");
  const { isVideo, withCoords, onCaptureCallback, onCloseCallback } = props;
  const { addNotification } = useStore();

  const webcamRef = React.useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraIsLoaded, setCameraIsLoaded] = useState<boolean>(false);
  const [withTime, setWithTime] = useState<boolean>(true);
  const [withCrosshair, setWithCrosshair, getWithCrosshair] =
    useStateRef<boolean>(true);
  const {
    position: geoPosition,
    info: geoInfo,
    isLoaded: geoIsLoaded,
  } = useGeolocation({
    withTime,
    disabled: !withCoords,
  });

  const isLoaded = useMemo(() => {
    return (withCoords ? geoIsLoaded : true) && cameraIsLoaded;
  }, [geoIsLoaded, cameraIsLoaded, withCoords]);

  /** Capturing photo */
  const [photos, setPhotos] = useState<CameraPhotoType[]>([
    null,
    null,
    null,
    null,
  ]);

  /** Capturing video */
  const mediaRecorderRef = React.useRef<MediaRecorder>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
  const [recordedCoords, setRecordedCoords] = useState<string[]>([]);

  const timeRadioHandler = () => {
    setWithTime(!withTime);
    localStorageService.setItem(LOCAL_STORAGE_KEY.TIMESTAMP_ENABLED, !withTime);
  };

  const crosshairRadioHandler = () => {
    setWithCrosshair(!withCrosshair);
    localStorageService.setItem(
      LOCAL_STORAGE_KEY.CROSSHAIR_ENABLED,
      !withCrosshair,
    );
  };

  const prepareGeoImage = (file: File, callback: (file: File) => void) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
      const canvas = canvasRef.current;

      if (canvas) {
        canvas.width = Math.max(image.width, 350);
        canvas.height = Math.max(image.height, 350);
        const ctx: CanvasRenderingContext2D = canvas.getContext(
          "2d",
        ) as CanvasRenderingContext2D;

        /** Draw canvas background if available */
        image && ctx.drawImage(image, 0, 0);

        if (withCoords) {
          canvasService.coords(canvas, geoInfo);
        }

        if (getWithCrosshair()) {
          canvasService.crosshair(canvas, image);
        }

        canvasService.toFile(canvas, file.name, (canvasFile) => {
          callback(canvasFile);
        });
      }
    };
  };

  const startCapture = () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: isSafari ? "video/mp4" : "video/webm",
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable,
      );
      mediaRecorderRef.current.start();
    }
  };

  const handleDataAvailable = ({ data }: BlobEvent) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const stopCapture = () => {
    mediaRecorderRef.current.stop();
    setIsCapturing(false);
  };

  const saveVideo = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: isSafari ? "video/mp4" : "video/webm",
      });
      let videoFile = new File(
        [blob],
        `camera-video.${isSafari ? "mp4" : "webm"}`,
        { type: blob.type },
      );
      onCaptureCallback(videoFile, recordedCoords);
      setRecordedChunks([]);
      setRecordedCoords([]);
    } else {
      addNotification({
        text: "Не удалось сохранить видео",
      });
      setRecordedChunks([]);
      setRecordedCoords([]);
    }
  };

  useEffect(() => {
    if (mediaRecorderRef.current) {
      if (
        mediaRecorderRef.current.state === "inactive" &&
        recordedChunks.length
      ) {
        saveVideo();
      }
    }
  }, [recordedChunks, isCapturing, mediaRecorderRef]);

  const addPhoto = (file: File) => {
    const newPhotos: CameraPhotoType[] = [...photos];
    const emptyIndex: number = newPhotos.findIndex((photo) => photo === null);
    const newPhoto: CameraPhotoType = {
      file,
      src: URL.createObjectURL(file),
    };

    if (emptyIndex !== -1) {
      newPhotos[emptyIndex] = newPhoto;
    } else {
      newPhotos.pop();
      newPhotos.unshift(newPhoto);
    }
    setPhotos(newPhotos);
  };

  const screenshot = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc: string = webcamRef.current.getScreenshot() as string;
      const file = fileService.dataURLtoFile(imageSrc, "camera-photo.jpeg");

      if (withCoords ? geoPosition.coords : true) {
        prepareGeoImage(file, (preparedFile) => {
          addPhoto(preparedFile);
        });
      } else {
        addNotification({
          text: "Необходима информация о местоположении",
        });
      }
    }
  }, [webcamRef, geoPosition, photos]);

  const deletePhoto = (index: number) => {
    const newPhotos = [...photos];

    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  async function handleCameraPermission(status: PermissionStatus) {
    if (status.state === "prompt") {
      addNotification({
        text: "Необходимо разрешить использование камеры",
        type: NOTIFICATION_TYPE.WARNING,
      });
    } else if (status.state === "denied") {
      onCloseCallback();
      addNotification({
        text: "Вы запретили использовать камеру",
      });
    }
  }

  useEffect(() => {
    /** Get timestamp option from local storage */
    const localWithTime = localStorageService.getItem<boolean>(
      LOCAL_STORAGE_KEY.TIMESTAMP_ENABLED,
    );
    if (typeof localWithTime === "boolean") setWithTime(localWithTime);

    /** Get crosshair option from local storage */
    const localWithCrosshair = localStorageService.getItem<boolean>(
      LOCAL_STORAGE_KEY.CROSSHAIR_ENABLED,
    );
    if (typeof localWithCrosshair === "boolean")
      setWithCrosshair(localWithCrosshair);

    let cameraPermissionStatus: PermissionStatus;
    let cameraPermissionChangeHandler: () => void;

    navigator.permissions.query({ name: "camera" }).then((permissionStatus) => {
      cameraPermissionChangeHandler = () => {
        handleCameraPermission(permissionStatus);
      };
      cameraPermissionChangeHandler();
      cameraPermissionStatus = permissionStatus;
      cameraPermissionStatus.addEventListener(
        "change",
        cameraPermissionChangeHandler,
      );
    });

    return () => {
      if (cameraPermissionStatus) {
        cameraPermissionStatus.removeEventListener(
          "change",
          cameraPermissionChangeHandler,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (isCapturing && withCoords) {
      setRecordedCoords((oldCoords) => [...oldCoords, geoInfo.join("\n")]);
    }
  }, [isCapturing, geoInfo, withCoords]);

  return (
    <div className={cn()}>
      <button type="button" className={cn("close")} onClick={onCloseCallback}>
        <BackIcon color={COLOR.WHITE} />
      </button>
      <canvas ref={canvasRef} className={cn("canvas")} />
      <div className={cn("wrapper")}>
        <div
          className={cn("crosshair", { visible: isLoaded && withCrosshair })}
        />
        <div className={cn("geo", { visible: isLoaded })}>
          {withCoords &&
            geoInfo.map((infoString) => (
              <div key={infoString} className={cn("geo-info")}>
                {infoString}
              </div>
            ))}
          <div className={cn("options", { "no-coords": !withCoords })}>
            {withCoords && (
              <RadioButton
                formName="camera"
                name="timestamp"
                value="enable"
                label="Показывать время"
                checked={withTime}
                disabled={isCapturing}
                onClick={timeRadioHandler}
              />
            )}
            <RadioButton
              formName="camera"
              name="crosshair"
              value="enable"
              label="Показывать прицел"
              checked={withCrosshair}
              disabled={isCapturing}
              onClick={crosshairRadioHandler}
            />
          </div>
        </div>
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={PhotocamVideoConstraints}
          width={1280}
          height={720}
          screenshotFormat="image/jpeg"
          className={cn("webcam", { visible: isLoaded, photo: !isVideo })}
          onPlay={() => {
            setCameraIsLoaded(true);
          }}
        />
        {isLoaded ? (
          !isVideo && (
            <button
              className={cn("screenshot")}
              onClick={() => {
                screenshot();
              }}
            >
              <PhotoIcon width={24} height={24} />
            </button>
          )
        ) : (
          <div className={cn("loader-block")}>
            <div className={cn("loader-text")}>
              {cameraIsLoaded
                ? "Устанавливаем соединение со спутником"
                : "Устанавливаем соединение с камерой"}
            </div>
            <LoadingIcon className={cn("loader")} />
          </div>
        )}
      </div>
      {isLoaded && (
        <div className={cn("footer")}>
          {isVideo ? (
            <button
              className={cn("submit")}
              onClick={() => {
                isCapturing ? stopCapture() : startCapture();
              }}
            >
              {isCapturing ? "Остановить запись" : "Начать запись"}
            </button>
          ) : (
            <React.Fragment>
              <div className={cn("gallery")}>
                {photos.map((photo, index) => {
                  return (
                    <div key={index} className={cn("photo-wrapper")}>
                      <button
                        type="button"
                        className={cn("photo-block")}
                        onClick={() => {
                          if (photo) {
                            onCaptureCallback(photo.file);
                          }
                        }}
                      >
                        {photo && <img src={photo.src} alt={photo.file.name} />}
                      </button>
                      {photo && (
                        <button className={cn("photo-remove")}>
                          <CloseIcon
                            onClick={(event) => {
                              event.stopPropagation();
                              deletePhoto(index);
                            }}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

export default Camera;
