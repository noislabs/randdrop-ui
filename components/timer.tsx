import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

interface ITimer {
  days: number,
  hours: number,
  minutes: number,
  seconds: number
}

const isTimerZero = (timer: ITimer): boolean => {
  return timer.days === 0 && timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0;
};

const prettySecs = (secs: number): ITimer => {
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = Math.floor(secs % 60);

  if (secs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    } as ITimer;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
  } as ITimer;
}

export const ClaimingWindowTimer = ({
  dateNow,
  endTimer,
}: {
  dateNow: number;
  endTimer: number;
}) => {

  let difference = Math.floor((endTimer - dateNow) / 1000);

  function makeTimer() {
    let start = difference;

    return () => {
      if (start === 1) {
        start = 0;
        return 0;
      } else {
        start -= 1;
        return start - 1;
      }
    };
  }

  const expRef = useRef(makeTimer());

  const { data: timerVal } = useQuery(
    ["claim_window_timer"],
    expRef.current,
    {
      refetchInterval: 1000,
      select: (timeleft) => {
        return prettySecs(timeleft);
      },
    }
  );


  if (!timerVal || isTimerZero(timerVal) === true) {
    return (
      <div className="text-2xl text-nois-green font-mono">
        {"Claim window open!"}
      </div>
    )
  }

  return (
    <div className="text-nois-white/70 text-2xl font-mono flex gap-x-1">
      <div className="text-nois-white">{timerVal.days.toString().padStart(2, "0")}</div>
      <div>{`D`}</div>
      <div>{`:`}</div>
      <div className="text-nois-white">{timerVal.hours.toString().padStart(2, "0")}</div>
      <div>{`H`}</div>
      <div>{`:`}</div>
      <div className="text-nois-white">{timerVal.minutes.toString().padStart(2, "0")}</div>
      <div>{`M`}</div>
      <div>{`:`}</div>
      <div className="text-nois-white">{timerVal.seconds.toString().padStart(2, "0")}</div>
      <div>{`S`}</div>
    </div>
  );
};