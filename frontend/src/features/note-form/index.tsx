import { FilesApiService } from "api/files";
import { NoteApiService } from "api/notes";
import { AxiosProgressEvent } from "axios";
import FileInput from "components/file-input";
import { FILE_INPUT_TYPE } from "components/file-input/constants";
import { LoadingIcon } from "components/icons/loading";
import { PhotoIcon } from "components/icons/photo";
import { VideoIcon } from "components/icons/video";
import { FILE_LIFE } from "constants/files";
import { NOTIFICATION_TYPE } from "constants/notifications";
import { ROUTE } from "constants/router";
import NotePhoto from "features/note-photo";
import NoteVideo from "features/note-video";
import notesHelper from "helpers/notes";
import useGeolocation from "hooks/use-geolocation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "services/api";
import cnService from "services/cn";
import fileService from "services/file";
import routerService from "services/router";
import useStore from "store/hook";
import { ApiProgressType } from "types/api";
import { NotePhotoType, NoteUpdateDataType, NoteVideoType } from "types/notes";
import "./index.scss";
import { relative } from "path";
import { CookieService } from "api/cookie";

interface NoteFormProps {
  /** Note id */
  id?: number;
}

const apiProgress: ApiProgressType = apiService.initProgress();

function NoteForm(props: NoteFormProps) {
  const { id } = props;
  const cn = cnService.createCn("note-form");
  const navigate = useNavigate();
  const store = useStore();
  const {
    addNotification,
    user: { id: userId },
  } = store;

  const [text, setText] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [number, setNumber] = useState<number>();

  const [photoId, setPhotoId] = useState<number>(1);
  const [videoId, setVideoId] = useState<number>(1);
  const [photos, setPhotos] = useState<NotePhotoType[]>([]);
  const [videos, setVideos] = useState<NoteVideoType[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [withProgress, setWithProgress] = useState<boolean>(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const [speed, setSpeed] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const [activeRef, setActiveRef] = useState<React.RefObject<HTMLInputElement> | null>(ref1); // Указываем тип для activeRef
  const [withCoords, setWithCoords] = useState<boolean>(false);

  const handleButtonClick = () => {
    if (activeRef && activeRef.current) {
      activeRef.current.click();
    }
  };

  const [isPhotoWithCoords, setIsPhotoWithCoords] = useState<boolean>(false);
  const [isVideoWithCoords, setIsVideoWithCoords] = useState<boolean>(false);

  const { info: geoInfo } = useGeolocation({
    withTime: true,
    disabled: !isPhotoWithCoords && !isVideoWithCoords,
  });

  const files = useMemo(() => {
    return [...photos, ...videos];
  }, [photos, videos]);

  const fileNames = useMemo(() => {
    return files.map((file) => file.name);
  }, [files]);

  const prepareFileName = (file: File): File => {
    const fileName = fileService.prepareFilename(fileNames, file.name);
    return fileService.changeName(file, fileName);
  };

  const addPhoto = (photo: File) => {
    const file = prepareFileName(photo);
    const src = URL.createObjectURL(file);
    const newPhotos: NotePhotoType[] = [
      ...photos,
      {
        id: photoId,
        name: file.name,
        src,
        file,
      },
    ];
    setPhotos(newPhotos);
    setPhotoId(photoId + 1);
  };

  const addVideo = (video: File, coords?: string[]) => {
    const file = prepareFileName(video);
    const src = URL.createObjectURL(file);
    const newVideos: NoteVideoType[] = [
      ...videos,
      {
        id: videoId,
        name: file.name,
        src,
        file,
        coords: coords,
      },
    ];
    setVideos(newVideos);
    setVideoId((oldVideoId) => oldVideoId + 1);
  };

  const deletePhoto = (index: number) => {
    const newPhotos: NotePhotoType[] = [...photos];
    const photoToDelete = photos[index];

    if (!photoToDelete.file) {
      setFilesToDelete([...filesToDelete, photoToDelete.name]);
    }

    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const updateVideo = (videoId: number, updates: Partial<NoteVideoType>) => {
    setVideos((oldVideos) => {
      const newVideos: NoteVideoType[] = [...oldVideos];
      const videoIndex: number = newVideos.findIndex(
        (video) => video.id === videoId,
      );

      if (videoIndex !== -1) {
        newVideos[videoIndex] = { ...newVideos[videoIndex], ...updates };
      }

      return newVideos;
    });
  };

  const deleteVideo = (videoId: number) => {
    setVideos((oldVideos) => {
      const newVideos: NoteVideoType[] = [...oldVideos];
      const videoIndex: number = newVideos.findIndex(
        (video) => video.id === videoId,
      );

      if (videoIndex !== -1) {
        const videoToDelete = videos[videoIndex];

        newVideos.splice(videoIndex, 1);
        if (!videoToDelete.file) {
          setFilesToDelete([...filesToDelete, videoToDelete.name]);
        }
      }

      return newVideos;
    });
  };

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => {
    setIsLoading(false);
    setWithProgress(false);
    setIsProcessingFiles(false);
    setPercent(0);
    setSpeed("");
    setTimeLeft("");
  };

  const handleProgress = (event: AxiosProgressEvent) => {
    const {
      percent: progressPercent,
      timeLeft,
      speed,
    } = apiService.progressHandler(event, apiProgress);

    setTimeLeft(timeLeft);
    setSpeed(speed);
    setPercent(progressPercent);

    if (progressPercent >= 100) {
      setWithProgress(false);
      setIsProcessingFiles(true);
    }
  };

  let is_session = CookieService.getCookie('session-active')?true:false;

  const saveNote = async () => {
    debugger
    apiProgress.reset();
    startLoading();
    /** All videos should be loaded */
    if (videos.find((video) => video.isProcessing)) {
      addNotification({
        text: "Дождитесь обработки видео файлов",
        type: NOTIFICATION_TYPE.WARNING,
      });
      return stopLoading();
    }

    /** New files to be added
     * Without videos that errors while processing */
    const preparedVideos: NoteVideoType[] = videos.filter(
      (video: NoteVideoType) => !video.isError,
    );
    const preparedFilenames: string[] = [...photos, ...preparedVideos].map(
      (file) => file.name,
    );

    /** Note should not be empty */
    if (!(photos.length || preparedVideos.length || text.trim())) {
      addNotification({
        text: "Необходимо заполнить заметку",
        type: NOTIFICATION_TYPE.WARNING,
      });
      return stopLoading();
    }

    if (id) {
      try {
        /** New files to be added
         * Without videos that errors while processing */
        const newFiles = files.filter(
          (file: NoteVideoType | NotePhotoType) =>
            (file.file || (file as NoteVideoType).fileURL) &&
            !(file as NoteVideoType).isError,
        );
        let directoryId = link ? link : "";

        if (filesToDelete) {
          await Promise.all(
            filesToDelete.map(async (fileName) => {
              return (await FilesApiService.delete(link, fileName)).data;
            }),
          );
        }

        if (newFiles.length) {
          setWithProgress(true);

          const filesFormData = notesHelper.filesToApi(newFiles);

          /** Add file in the same directory */
          if (link) {
            await FilesApiService.add(
              filesFormData,
              directoryId,
              handleProgress,
            );

            /** Create new directory with added files */
          } else {
            directoryId = (
              await FilesApiService.create(
                filesFormData,
                {
                  life: FILE_LIFE.INFINITY,
                  compress: false,
                },
                handleProgress,
              )
            ).data;
          }
        }

        const noteData = notesHelper.toApi({
          text:text.trim(),
          fileNames: preparedFilenames,
          userId,
          noteId: id,
          directoryId,
        });

        await NoteApiService.update(noteData as NoteUpdateDataType);

        addNotification({
          title: `Заметка #${number}`,
          text: "Заметка успешно сохранена",
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        stopLoading();
        navigate(routerService.path(ROUTE.NOTEPAD));
      } catch (e) {
        console.log("error", e);
        addNotification({
          title: `Заметка #${number}`,
          text: "Не удалось сохранить заметку",
        });
        stopLoading();
      }
      debugger
    } else {
      try {
        debugger
        let directoryId = "";
        const preparedFiles = [...photos, ...preparedVideos];

        if (preparedFiles.length) {
          setWithProgress(true);

          debugger
          const filesFormData = notesHelper.filesToApi(preparedFiles);
          directoryId = (
            await FilesApiService.create(
              filesFormData,
              {
                life: FILE_LIFE.INFINITY,
                compress: false,
              },
              handleProgress,
            )
          ).data;
        }

        const noteData = notesHelper.toApi({
          text:text.trim(),
          fileNames: preparedFilenames,
          userId,
          directoryId,
          is_session,
        });

        console.log({
          text:text.trim(),
          fileNames: preparedFilenames,
          userId,
          directoryId,
          is_session,
        })

        await NoteApiService.create(noteData);

        addNotification({
          text: "Заметка успешно создана",
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        stopLoading();
        navigate(routerService.path(ROUTE.NOTEPAD));
      } catch (e) {
        console.log("error", e);
        addNotification({
          text: "Не удалось создать заметку",
        });
        stopLoading();
      }
    }
  };

  const getNote = async () => {
    try {
      if (id) {
        startLoading();
        const response = await NoteApiService.get(userId, id);
        const note = notesHelper.fromApi(response.data);

        setText(note.text);
        setVideos(note.videos);
        setVideoId(note.videos.length + 1);
        setPhotos(note.photos);
        note.link && setLink(note.link);
        setNumber(note.number);
        stopLoading();
      }
    } catch (e: any) {
      console.log("error", e);
      addNotification({
        title: `Заметка ${id}`,
        text: "Не удалось загрузить заметку",
      });
      stopLoading();
      navigate(routerService.path(ROUTE.NOTEPAD));
    }
  };

  useEffect(() => {
    getNote();
  }, [id]);

  return (
    <div className={cn()}>
      <div className={cn("title")}>
        {id ? `Редактирование заметки #${number}` : "Создание заметки"}
      </div>
    
      <div style={{display: 'flex'}}>
        <div onClick={handleButtonClick} className={cn("add-btn")}>+</div>
        
        <div style={{display: 'flex', flexWrap: 'wrap', marginTop: 'auto'}}>

        <label className={cn("choos_file_type_btn")} style={{border: activeRef===ref1?'1px solid #fff':'1px solid #2d2d2d'}} htmlFor={'choosePhoto'}>
          <input style={{display: 'none'}} type="radio" name="chooseFile" onClick={()=>setActiveRef(ref1)} id="choosePhoto"/>
          Фото
        </label>    
        <label className={cn("choos_file_type_btn")} style={{border: activeRef===ref2?'1px solid #fff':'1px solid #2d2d2d'}} htmlFor={'chooseVideo'}>
          <input style={{display: 'none'}} type="radio" name="chooseFile" onClick={()=>setActiveRef(ref2)} id="chooseVideo"/>
          Видео
        </label> 

        <label style={{display: "flex", justifyContent: "space-between", fontSize: '13px', marginTop: '10px', width: '100%', alignItems: 'center', cursor: 'pointer'}} htmlFor={'Coords'}>
          <input style={{display: 'none'}} onClick={()=>{setWithCoords(!withCoords)}} type="checkbox" name="setCoords" id="Coords" />
          Наложить координаты
              <div style={{display: "flex", alignItems: 'center', position: 'relative', width: '60px', height: '30px', borderRadius: '15px', border: '1px solid #2d2d2d', cursor: 'pointer'}}>
                <div style={{position: 'absolute', left: withCoords ? '30px':'0', height: '30px', width: '30px', borderRadius: '50%', backgroundColor: withCoords?'#0e9594':'#2d2d2d', transition: '.3s'}}></div>
              </div>
        </label>
        </div>
      </div>
      <FileInput
        id="noteFormPhoto"
        type={FILE_INPUT_TYPE.IMAGE}
        icon={<PhotoIcon />}
        disabled={isLoading}
        addFileCallback={(file) => {
          addPhoto(file);
        }}
        withGeo={true}
        geoInfo={geoInfo}
        onChangeCoordsCallback={(value) => setIsPhotoWithCoords(value)}
        ref={ref1}
        withCoords={withCoords}
        setWithCoords={setWithCoords}
      />
      {!!photos.length && (
        <div className={cn("section")}>
          <div className={cn("section-title")}>Материалы:</div>
          <div className={cn("section-list")}>
            {photos.map((photo, index) => (
              <NotePhoto
                key={index}
                photo={photo}
                disabled={isLoading}
                onDeleteCallback={() => deletePhoto(index)}
              />
            ))}
          </div>
        </div>
      )}

      <FileInput
        id="noteFormVideo"
        type={FILE_INPUT_TYPE.VIDEO}
        icon={<VideoIcon />}
        disabled={isLoading}
        addFileCallback={(file, coords?: string[]) => {
          addVideo(file, coords);
        }}
        withGeo={true}
        geoInfo={geoInfo}
        onChangeCoordsCallback={(value) => setIsVideoWithCoords(value)}
        ref={ref2}
        withCoords={withCoords}
        setWithCoords={setWithCoords}
      />
      {!!videos.length && (
        <div className={cn("section")}>
          <div className={cn("section-title")}>Видео:</div>
          <div className={cn("section-list")}>
            {videos.map((video, index) => (
              <NoteVideo
                key={video.id}
                video={video}
                disabled={isLoading}
                onUpdateCallback={(updates) => updateVideo(video.id, updates)}
                onDeleteCallback={() => deleteVideo(video.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      <textarea
        className={cn("input")}
        value={text}
        disabled={isLoading}
        onChange={(event) => setText(event.target.value)}
      />

      <button
        className={cn("submit")}
        disabled={isLoading}
        onClick={() => {
          saveNote();
        }}
      >
        {isLoading ? (
          <React.Fragment>
            {isProcessingFiles && (
              <div className={cn("processing")}>Идет обработка файлов</div>
            )}
            {withProgress ? (
              <div className={cn("progress")}>
                <div
                  className={cn("progress-bar")}
                  style={{ width: `${percent}%` }}
                ></div>
                <div className={cn("progress-percent")}>{percent}%</div>
                <div className={cn("progress-speed")}>{speed}</div>
                <div className={cn("progress-time")}>осталось {timeLeft}</div>
              </div>
            ) : (
              <LoadingIcon />
            )}
          </React.Fragment>
        ) : id ? (
          "Сохранить"
        ) : (
          "Создать"
        )}
      </button>
    </div>
  );
}

export default NoteForm;
