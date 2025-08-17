import React, {
  ChangeEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
  forwardRef,
  ForwardedRef,
} from "react";
import { arrayService } from "services/array";
import { canvasService } from "services/canvas";
import cnService from "services/cn";
import fileService from "services/file";
import { localStorageService } from "services/localStorage";
import useStore from "store/hook";
import { FILE_INPUT_TYPE, FileInputTypeData } from "./constants";
import "./index.scss";
import Camera from "features/camera";
import heic2any from "heic2any";
import { FileImageDecodeExtensions } from "constants/files";
import { LOCAL_STORAGE_KEY } from "constants/localStorage";
import RadioButton from "components/radio-button";

interface FileInputProps {
  id: string;
  icon: ReactNode;
  type?: FILE_INPUT_TYPE;
  withGeo?: boolean;
  disabled?: boolean;
  geoInfo?: string[];
  addFileCallback: (file: File, coords?: string[]) => void;
  onChangeCoordsCallback?: (value: boolean) => void;
  withCoords: boolean;
  setWithCoords: (value: boolean) => void;
}

const FileInput = forwardRef(
  (props: FileInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      id,
      icon,
      disabled,
      type = FILE_INPUT_TYPE.DEFAULT,
      withGeo = false,
      geoInfo = [],
      addFileCallback,
      onChangeCoordsCallback = () => {},
      withCoords,
      setWithCoords,
    } = props;
    const isVideo: boolean = type === FILE_INPUT_TYPE.VIDEO;
    const cn = cnService.createCn("file-input");

    const { addNotification } = useStore();
    const { accept, allowedTypes, typeError } = FileInputTypeData[type];

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isCamera, setIsCamera] = useState<boolean>(false);

    useEffect(() => {
      onChangeCoordsCallback(withCoords);
    }, [withCoords]);

    async function readFile(event: any, file: File) {
      try {
        const blob = new Blob([new Uint8Array(event.target.result)], {
          type: file.type,
        });
        const png = await heic2any({ blob });
        let preparedFile = new File(Array.isArray(png) ? png : [png], "name");
        preparedFile = fileService.changeName(
          preparedFile,
          fileService.changeExtension(file.name, "png")
        );

        addFile(preparedFile);
      } catch (e) {
        addNotification({
          title: "Не удалось конвертировать изображение",
          text: "Попробуйте другой формат",
        });
      }
    }

    const addFile = (file: File) => {
      addFileCallback(file);
    };

    const closeCamera = () => {
      setIsCamera(false);
    };

    /** photo is prepared file with coordinates */
    const captureHandler = (photo: File) => {
      closeCamera();
      addFile(photo);
    };

    /** prepared video file and image with coordinates */
    const captureVideoHandler = (video: File, coords?: string[]) => {
      closeCamera();
      addFileCallback(video, withCoords ? coords : undefined);
    };

    const openCamera = (event: MouseEvent) => {
      event.preventDefault();
      setIsCamera(true);
    };

    const prepareImage = (file: File) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = function () {
        const canvas = canvasRef.current;

        if (canvas) {
          canvas.width = Math.max(image.width, 350);
          canvas.height = Math.max(image.height, 350);
          const ctx: CanvasRenderingContext2D = canvas.getContext(
            "2d"
          ) as CanvasRenderingContext2D;

          /** Draw canvas background if available */
          image && ctx.drawImage(image, 0, 0);

          if (withCoords) {
            canvasService.coords(canvas, geoInfo);
          }

          canvasService.toFile(canvas, file.name, (canvasFile) => {
            addFile(canvasFile);
          });
        }
      };
    };

    const changeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        const extension = fileService.getExtension(file.name);

        /** Is not browser supported type */
        if (FileImageDecodeExtensions.includes(extension)) {
          try {
            const reader = new FileReader();
            reader.addEventListener("load", (event) => readFile(event, file));
            reader.readAsArrayBuffer(file);
          } catch (e) {
            addNotification({
              text: "Невалидный файл",
            });
          }

          /** Is not allowed type */
        } else if (allowedTypes && !allowedTypes.includes(file.type)) {
          addNotification({ text: typeError });

          /** Allowed type */
        } else {
          if (withCoords) {
            if (isVideo) {
              fileService.getVideoDuration(file, (duration) => {
                const coords = arrayService.fromNumber<string>(
                  duration,
                  geoInfo.join("\n")
                );
                addFileCallback(file, coords);
              });
            } else {
              prepareImage(file);
            }
          } else {
            addFile(file);
          }
        }
      }

      /* Allow to upload same file more than once */
      event.target.value = "";
    };

    const geoRadioHandler = () => {
      const newWithCoords = !withCoords;

      setWithCoords(newWithCoords);
      localStorageService.setItem(
        isVideo
          ? LOCAL_STORAGE_KEY.VIDEO_GEO_ENABLED
          : LOCAL_STORAGE_KEY.PHOTO_GEO_ENABLED,
        newWithCoords
      );
    };

    useEffect(() => {
      /** Get geo option from local storage */
      const localWithCoords = localStorageService.getItem<boolean>(
        isVideo
          ? LOCAL_STORAGE_KEY.VIDEO_GEO_ENABLED
          : LOCAL_STORAGE_KEY.PHOTO_GEO_ENABLED
      );
      if (typeof localWithCoords === "boolean") {
        setWithCoords(localWithCoords);
      }
    }, []);

    return (
      <div className={cn("wrapper")}>
        <canvas ref={canvasRef} className={cn("canvas")} />
        {isCamera && (
          <Camera
            onCaptureCallback={isVideo ? captureVideoHandler : captureHandler}
            onCloseCallback={closeCamera}
            isVideo={isVideo}
            withCoords={withCoords}
          />
        )}
        <div className={cn("options")}>
          {/* <button
          className={cn("label", { disabled })}
          type="button"
          onClick={openCamera}
        >
          {isVideo ? "Записать" : "Сделать фото"}
          {icon}
        </button> */}
          <label style={{display: 'none'}} className={cn("label", { disabled })} htmlFor={id}>
            Прикрепить
            {icon}
            <input
              id={id}
              type="file"
              accept={accept}
              className={cn()}
              disabled={disabled}
              onChange={changeHandler}
              ref={ref} // Передаем ref в <input>
            />
          </label>
        </div>
        {withGeo && (
          <RadioButton
            formName="file-input"
            name={id}
            value="enable"
            label="Добавить координаты"
            checked={withCoords}
            onClick={geoRadioHandler}
          />
        )}
      </div>
    );
  }
);

export default FileInput;