import { NOTIFICATION_TYPE } from "constants/notifications";
import { useStateRef } from "hooks/use-state-ref";
import { useEffect, useMemo, useState } from "react";
import { dateService } from "services/date";
import { numberService } from "services/number";
import useStore from "store/hook";
import { UseGeolocationCoordsType, UseGeolocationPositionType } from "./types";

let lastCoords: UseGeolocationCoordsType[] = [];
let timestamp: number = dateService.getTimestamp();
let permissionState: PermissionState;

interface UseGeolocationProps {
  withTime?: boolean;
  disabled?: boolean;
  onChangeCallback?: (geo: GeolocationPosition) => void;
}

function useGeolocation(props: UseGeolocationProps) {
  const { withTime, disabled } = props;
  const { addNotification } = useStore();

  const [isLoaded, setIsLoaded, getIsLoaded] = useStateRef<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [position, setPosition] = useState<UseGeolocationPositionType>({
    timestamp,
  });

  const info = useMemo<string[]>(() => {
    const { coords } = position;

    if (coords) {
      const date = new Date(timestamp);
      const heightText =
        coords.altitude || coords.altitudeAccuracy
          ? `Высота: ${coords.altitude || ""}${coords.altitudeAccuracy ? `±${coords.altitudeAccuracy}` : ""} м`
          : "Высота: неизвестно";

      return [
        `Широта: ${coords.latitude}`,
        `Долгота: ${coords.longitude}`,
        heightText,
        `Точность: ${coords.accuracy} м`,
        withTime ? `Время: ${dateService.toString(date)}` : "",
      ];
    }

    return ["Не удалось установить местоположение"];
  }, [position, withTime, disabled]);

  const getAveragePosition = (): UseGeolocationCoordsType => {
    const sumCoords: UseGeolocationCoordsType = lastCoords.reduce(
      (sum, positionItem) => {
        sum.latitude += positionItem.latitude;
        sum.longitude += positionItem.longitude;
        if (positionItem.altitude) {
          sum.altitude =
            sum.altitude === null
              ? positionItem.altitude
              : sum.altitude + positionItem.altitude;
        }

        return sum;
      },
      { latitude: 0, longitude: 0, altitude: null },
    );

    console.log(      Number((sumCoords.latitude / lastCoords.length).toFixed(6)),
      Number((sumCoords.longitude / lastCoords.length).toFixed(6)),
          sumCoords.altitude)
    return {
      latitude: Number((sumCoords.latitude / lastCoords.length).toFixed(6)),
      longitude: Number((sumCoords.longitude / lastCoords.length).toFixed(6)),
      altitude:
        sumCoords.altitude === null
          ? sumCoords.altitude
          : numberService.maxFloating(sumCoords.altitude / lastCoords.length),
    };
  };

  const handlePosition = (newPosition: GeolocationPosition) => {
    // console.log(newPosition);
    const { coords } = newPosition;
    if (!coords) return;

    if (isError) {
      setIsError(false);
      addNotification({ text: "Соединение со спутниками восстановлено" });
    }

    const preparedCoords: GeolocationCoordinates = {
      latitude: Number(coords.latitude.toFixed(6)),
      longitude: Number(coords.longitude.toFixed(6)),
      speed: coords.speed,
      heading: coords.heading,
      altitude: coords.altitude
        ? numberService.maxFloating(coords.altitude)
        : null,
      altitudeAccuracy: coords.altitudeAccuracy
        ? numberService.maxFloating(coords.altitudeAccuracy)
        : null,
      accuracy: numberService.maxFloating(coords.accuracy),
    };

    lastCoords.push({
      latitude: preparedCoords.latitude,
      longitude: preparedCoords.longitude,
      altitude: preparedCoords.altitude,
    });

    if (lastCoords.length > 5) {
      lastCoords.shift();
    }

    setPosition({
      coords: {
        ...preparedCoords,
        ...getAveragePosition(),
      },
      timestamp: timestamp,
    });

    if (!getIsLoaded()) {
      addNotification({
        type: NOTIFICATION_TYPE.SUCCESS,
        text: "Успешная синхронизация со спутниками",
      });
      setIsLoaded(true);
    }
  };

  const handlePositionError = (error: GeolocationPositionError) => {
    console.log("geo error", error);
    setPosition({ timestamp });
    if (permissionState === "granted") {
      addNotification({ text: "Потеряно соединение со спутниками" });
      setIsError(true);
    }
  };

  useEffect(() => {
    if (!disabled) {
      const watchGeolocation = navigator.geolocation.watchPosition(
        handlePosition,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 1000,
          maximumAge: 0,
        },
      );

      const getTimestamp = () => {
        timestamp = dateService.getTimestamp();
        setPosition(({ coords }) => {
          return {
            coords,
            timestamp,
          };
        });
      };
      const timestampInterval: number = window.setInterval(getTimestamp, 1000);

      let permissionStatus: PermissionStatus;
      let permissionChangeHandler: () => void;

      navigator.permissions.query({ name: "geolocation" }).then((status) => {
        permissionChangeHandler = () => {
          permissionState = status.state;
          if (status.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              handlePosition,
              handlePositionError,
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              },
            );
            addNotification({
              text: "Вы разрешили использование местоположения",
              type: NOTIFICATION_TYPE.SUCCESS,
            });
          } else if (status.state === "denied") {
            addNotification({
              text: "Вы запретили использование местоположения",
            });
          }
        };

        if (status.state === "denied") {
          addNotification({
            text: "Вы запретили использование местоположения",
          });
        }
        permissionStatus = status;
        permissionStatus.addEventListener("change", permissionChangeHandler);
      });

      return () => {
        navigator.geolocation.clearWatch(watchGeolocation);
        window.clearInterval(timestampInterval);
        lastCoords = [];

        if (permissionStatus) {
          permissionStatus.removeEventListener(
            "change",
            permissionChangeHandler,
          );
        }
      };
    }
  }, [disabled]);

  return {
    isLoaded,
    position,
    info,
  };
}

export default useGeolocation;
