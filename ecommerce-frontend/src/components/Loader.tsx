import React from 'react'

const loader = () => {
  return (
    <div className='loader'>Loading...</div>
  )
}

export default loader

interface SkeletonProps {
  width?:string,
  count?:number,
}

export const Skelton = ({width="unset",count = 3}:SkeletonProps)=>{
  const skeleton = Array.from({length:count}, (_, k) => (
    <div key={k} className="skeleton-shape"></div>
  ));
  return (
    <div className="skeleton-loader" style={{width}}>
      {skeleton}
    </div>
  );
}