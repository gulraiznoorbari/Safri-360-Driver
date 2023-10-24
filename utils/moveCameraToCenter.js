export const moveCameraToCenter = async (mapRef, position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
        camera.center = position;
        mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
};
