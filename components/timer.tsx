import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
// Date.now()
// 1685479580193

// Claim Opens
// 1685500001

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
  // Take in current date and listing.endTimer
  // let current_date = Date.now();
  // let endTimer = Date.now() + 400_000; // 400 seconds

  // Calculate difference, this is the length of the timer in seconds
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

  // timerVal will only be undefined if ref to function returns undefined
  // if (!timerVal) {
  //   return null;
  // }

  if (!timerVal || isTimerZero(timerVal) === true) {
    return (
      <div className="text-2xl text-nois-green font-mono">
        {"Claim window open!"}
      </div>
    )
  }

  // If timerVal is {days: 0, hours: 0, minutes: 0, seconds: 0}, return "Expired"
  // if (isEqual(timerVal, { days: 0, hours: 0, minutes: 0, seconds: 0 })) {
  //   return null;
  //   //return <div className="text-error/60 text-sm font-mono pl-2 flex">Expired</div>
  // }

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

  // if (timerVal.days === 0 && timerVal.hours === 0) {
  //   return (
  //     <div className="text-error/50 text-sm font-mono flex gap-x-1">
  //       <div>{padNumber(timerVal.days)}</div>
  //       <div>{`D : `}</div>
  //       <div>{padNumber(timerVal.hours)}</div>
  //       <div>{`H : `}</div>
  //       <div className={`${timerVal.minutes !== 0 && "text-error"}`}>
  //         {padNumber(timerVal.minutes)}
  //       </div>
  //       <div>{`M : `}</div>
  //       <div className="text-error">{padNumber(timerVal.seconds)}</div>
  //       <div>{`S`}</div>
  //       <AccessAlarmOutlinedIcon
  //         fontSize="small"
  //         className="text-error animate-bounce-low"
  //       />
  //     </div>
  //   );

  //   // return (
  //   //   <div className="text-error text-sm font-mono pl-2 flex">
  //   //     {`${padNumber(timerVal.days)}D : ${padNumber(timerVal.hours)}H : ${padNumber(timerVal.hours)}M : ${padNumber(timerVal.seconds)}S`}</div>
  //   // )
  // } else if (timerVal.days === 0) {
  //   return (
  //     <div className="text-warning/50 text-sm font-mono flex gap-x-1">
  //       <div>{padNumber(timerVal.days)}</div>
  //       <div>{`D :`}</div>
  //       <div className="text-warning">{padNumber(timerVal.hours)}</div>
  //       <div>{`H :`}</div>
  //       <div className="text-warning">{padNumber(timerVal.minutes)}</div>
  //       <div>{`M :`}</div>
  //       <div className="text-warning">{padNumber(timerVal.seconds)}</div>
  //       <div>{`S`}</div>
  //       <AccessAlarmOutlinedIcon
  //         fontSize="small"
  //         className="text-warning animate-bounce-low scale-75"
  //       />
  //     </div>
  //   );
  //   // return (
  //   //   <div className="text-warning text-sm font-mono pl-2 flex">
  //   //     {`${padNumber(timerVal.days)}D : ${padNumber(timerVal.hours)}H : ${padNumber(timerVal.hours)}M : ${padNumber(timerVal.seconds)}S`}
  //   //   </div>
  //   // )
  // } else {
  //   return (
  //     <div className="text-success/50 text-sm font-mono flex gap-x-1">
  //       <div className="text-success">{padNumber(timerVal.days)}</div>
  //       <div>{`D :`}</div>
  //       <div className="text-success">{padNumber(timerVal.hours)}</div>
  //       <div>{`H :`}</div>
  //       <div className="text-success">{padNumber(timerVal.minutes)}</div>
  //       <div>{`M :`}</div>
  //       <div className="text-success">{padNumber(timerVal.seconds)}</div>
  //       <div>{`S`}</div>
  //     </div>
  //   );
  // }
};