import React from 'react'
import HydraulicVisualizationModule from '../components/HydraulicVisualizationModule'

export default function page() {
    const sampleLayers = [
        {
          id: 'layer-1',
          name: 'Surface Casing',
          topDepth: 0,
          bottomDepth: 1500,
          properties: {
            pore_pressure: 8.9,
            fracture_gradient: 10.5,
          },
        },
        {
          id: 'layer-2',
          name: 'Intermediate Casing',
          topDepth: 1500,
          bottomDepth: 8000,
          properties: {
            pore_pressure: 10.2,
            fracture_gradient: 12.8,
          },
        },
        {
          id: 'layer-3',
          name: 'Production Casing',
          topDepth: 8000,
          bottomDepth: 12500,
          properties: {
            pore_pressure: 11.5,
            fracture_gradient: 13.2,
          },
        },
      ];
    return (
        <>
            <div>
                <HydraulicVisualizationModule
                    layers={sampleLayers}           // Array of geological layers
                    mudDensity={11.5}               // Mud weight in PPG
                    flowRate={350}                  // Pump rate in GPM
                    surfaceBackpressure={500}       // Applied backpressure in PSI
                />
            </div>
            


        
    </>
  )
}
