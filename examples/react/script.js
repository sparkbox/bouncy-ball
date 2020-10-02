const { useEffect, useRef, useState } = React;

// slightly modified code from the Vanilla.js example
const getPosition = (elapsedTime, h, k) => {
  const a = (4 * k) / Math.pow(h * 2, 2); // coefficient: -.000483932

  // Position as a function of time, using the vertex form
  // of the quadratic formula:  f(x) = a(x - h)^2 + k,
  // (where [h, k] is the vertex). See it graphically at:
  //    https://www.desmos.com/calculator/i6yunccp7v
  const ypos = a * Math.pow((((elapsedTime + h) % (h * 2)) - h), 2);

  return ypos;
};

// performs a Quadratic Ease in and Ease out repeatedly
function useQuadBounce({
  duration = 1150,
  start = 0,
  end = 160,
} = {}) {
  const timeStart = useRef(Date.now());
  const [value, setValue] = useState(start);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() - timeStart.current;
      setValue(start + getPosition(time, duration / 2, end - start));
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return value;
}

// default ball style, CSS in JS
const style = {
  display: 'block',
  position: 'absolute',
  width: 50,
  height: 50,
  borderRadius: '50%',
  backgroundColor: '#00CFFF',
};

function BouncyBall() {
  const y = useQuadBounce();

  return <div style={{ ...style, transform: `translate3d(0, ${y}px, 0)` }} />;
}

ReactDOM.render(<BouncyBall />, document.getElementById('root'));
