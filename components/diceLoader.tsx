import { useMemo } from "react";
import { ChainType } from "../pages/api/check";

function getDiceColor(chain: ChainType) {
  switch (chain) {
    case "injective":
      return "dice-injective";
    case "aura":
      return "dice-aura";
      case "osmosis":
        return "dice-osmosis";
    case "stargaze":
      return "dice-stargaze";
    default:
      return "dice-juno";
  }
}

const DiceLoader = ({chain}:{chain: ChainType}) => {

  const dicecolor = useMemo(() => {
    return getDiceColor(chain);
  }, [chain])

  return (
    <div className="dice-container">
      <div className={`${dicecolor}`}>
         <div className="front">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
         </div>
         <div className="back">
            <span></span>
         </div>
         <div className="right">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
         </div>
         <div className="left">
            <span></span>
            <span></span>
         </div>
         <div className="top">
            <span></span>
            <span></span>
            <span></span>
         </div>
         <div className="bottom">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
         </div>
      </div>
   </div>
  )
}

export default DiceLoader;