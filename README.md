<!-- USE EXAMPLE -->
import { EarthVisualization } from 'react-earth-3d';

function App() {
  return (
    <EarthVisualization 
      width="100%"
      height="100%"
      rotationSpeed={0.003}
      numStars={3000}
      earthTexturePath="/custom/earth-texture.jpg"
    />
  );
}