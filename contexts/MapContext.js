import React, { createContext, useContext, useRef } from "react";

const MapContext = createContext();

export const useMapContext = () => {
    return useContext(MapContext);
};

export const MapProvider = ({ children }) => {
    const mapRef = useRef(null);

    const value = {
        mapRef,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
