import { useElectronStore_isElectron } from "@/stores/electron";
import React from "react";
import { createBrowserRouter, createHashRouter, RouteObject, RouterProvider } from "react-router"

type TRouterProviderCustomProps = {
    routeObjects : RouteObject[]
} 

const RouterProviderCustom : React.FC<TRouterProviderCustomProps> = ({
    routeObjects
}) => {

    const isElectron = useElectronStore_isElectron()

    // return <RouterProvider router={ isElectron ? createHashRouter([ { path: "*", element : <Navigate to={"./"} replace /> }, ...routeObjects]) : createBrowserRouter(routeObjects) } />
    return <RouterProvider router={ createBrowserRouter(routeObjects) } />

}

export default RouterProviderCustom;