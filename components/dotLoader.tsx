const DotLoader = () => {
  return (
    <div className=" flex justify-evenly items-center h-full w-full">
      <span className="w-2 h-2 rounded-full bg-nois-white/60 inline-block animate-flash"/>
      <span className="w-2 h-2 rounded-full bg-nois-white/60 inline-block animate-flash [animation-delay:0.2s]"/>
      <span className="w-2 h-2 rounded-full bg-nois-white/60 inline-block animate-flash [animation-delay:0.4s]"/>
    </div>
  )
}

export default DotLoader;