import React from 'react';

const CollectionIcon = ({ size = "18px", color = "#adadad", ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 180 180"
      style={{ display: 'inline', verticalAlign: 'middle' }}
      {...props}
    >
      <path 
        d="M89.658-.266C19.753-.171-.598 20.163-.15 89.46c.454 70.084 20.261 90.912 89.476 90.805 70.909-.11 90.976-21.037 90.83-90.498C180.01 19.91 159.841-.362 89.658-.266m.073 20.13c50.426.249 69.572 20.491 70.312 69.95.755 50.522-19.544 70.142-70.57 70.311-48.884.163-68.827-19.67-69.516-70.55-.667-49.193 20.938-69.953 69.774-69.712m17.255 7.244c-6.303.016-8.87 2.728-3.91 5.685 17.714 10.562 29.276 31.033 37.516 43.312 8.956 13.345 20.525-10.758-1.113-32.964-11.834-12.144-24.885-16.052-32.493-16.033" 
        style={{            
          fill: color,
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 0.499999,
          strokeDasharray: 'none'
        }}
      />
    </svg>
  );
};

export default CollectionIcon;