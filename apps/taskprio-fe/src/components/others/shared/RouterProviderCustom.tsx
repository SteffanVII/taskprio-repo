import React from "react";
import { createHashRouter, RouteObject, RouterProvider } from "react-router"

type TRouterProviderCustomProps = {
    routeObjects : RouteObject[]
} 

const RouterProviderCustom : React.FC<TRouterProviderCustomProps> = ({
    routeObjects
}) => {

    return <RouterProvider router={ createHashRouter(routeObjects) } />

}

export default RouterProviderCustom;