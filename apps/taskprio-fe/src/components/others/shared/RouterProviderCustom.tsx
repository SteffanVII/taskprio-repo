import React from "react";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router"

type TRouterProviderCustomProps = {
    routeObjects : RouteObject[]
} 

const RouterProviderCustom : React.FC<TRouterProviderCustomProps> = ({
    routeObjects
}) => {

    return <RouterProvider router={ createBrowserRouter(routeObjects) } />

}

export default RouterProviderCustom;