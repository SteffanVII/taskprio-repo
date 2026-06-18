import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './lib/utils/themeProvider'
import MousePositionProvider from './lib/utils/mousePositionProvider'
import { Toaster } from './components/ui/sonner'
import { useLayoutEffect } from 'react'
import { v4 as uuidV4 } from "uuid";
import { SidebarProvider } from './components/ui/sidebar'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { createRouter, RouterProvider, createHashHistory } from '@tanstack/react-router'
import { routeTree } from "./routeTree.gen";

// const LoginRoute = lazy(() => import('./routes/public/login'))
// const AcceptRoute = lazy(() => import('./routes/public/accept'))
// const PrivateLayout = lazy(() => import('./services/private/PrivateLayout'))
// const MainPage = lazy(() => import('./routes/private/mainPage'))
// const ProjectPage = lazy(() => import('./routes/private/project/projectPage'))
// const TaskboardPage = lazy(() => import('./routes/private/project/taskboard/taskboardPage'))
// const ProjectSettingsPage = lazy(() => import('./routes/private/project/settings/projectSettingsPage'))
// const TaskTodoPage = lazy(() => import('./routes/private/taskTodo/taskTodoPage'))
// const WorkspaceSettingsPage = lazy(() => import('./routes/private/workspace/settings/workspaceSettingsPage'))
// const StatisticsPage = lazy(() => import('./routes/private/statistics/statisticsPage'))
// const TaskTodoPageOverlay = lazy(() => import('./routes/private/taskTodo/taskTodoPageOverlay'))
// const ProfilePage = lazy(() => import('./routes/private/profile/profilePage'))

const queryClient = new QueryClient()

// const routeObjects: RouteObject[] = [
//   {
//     path: "/",
//     element: <AuthLayout />,
//     children: [
//       {
//         path: "accept",
//         element: <Suspense><AcceptRoute /></Suspense>
//       },
//       {
//         path: "p",
//         element: <Suspense><PrivateLayout /></Suspense>,
//         children: [
//           {
//             path: "w/:workspace_id?",
//             element: <Suspense><MainPage /></Suspense>,
//             children: [
//               {
//                 path: "d/:project_id?",
//                 element: <Suspense><ProjectPage /></Suspense>,
//                 children: [
//                   {
//                     path: "t/:task_board_id?/:task_id?",
//                     element: <Suspense><TaskboardPage /></Suspense>
//                   },
//                   {
//                     path: "project_settings",
//                     element: <Suspense><ProjectSettingsPage /></Suspense>
//                   }
//                 ]
//               },
//               {
//                 path: "tt",
//                 element: <Suspense><TaskTodoPage /></Suspense>
//               },
//               {
//                 path: "workspace_settings",
//                 element: <Suspense><WorkspaceSettingsPage /></Suspense>
//               },
//               {
//                 path: "statistics",
//                 element: <Suspense><StatisticsPage /></Suspense>
//               }
//             ]
//           },
//           {
//             path: "task_todo_overlay/:workspace_id?",
//             element: <Suspense><TaskTodoPageOverlay /></Suspense>
//           },
//           {
//             path: "profile",
//             element: <Suspense><ProfilePage /></Suspense>
//           }
//         ]
//       }
//     ]
//   },
//   {
//     path: "login",
//     element: <Suspense><LoginRoute /></Suspense>
//   }
// ]

const hashHistory = createHashHistory()

// Router instance
const router = createRouter({ 
  routeTree: routeTree,
  history: hashHistory
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


function App() {

  useLayoutEffect(() => {
    if (!localStorage.getItem(import.meta.env.VITE_CLIENT_ID_LOCAL_STORAGE_NAME)) {
      localStorage.setItem(import.meta.env.VITE_CLIENT_ID_LOCAL_STORAGE_NAME, uuidV4())
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme' >
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
          <SidebarProvider>
            <MousePositionProvider>
              <RouterProvider router={router} />
            </MousePositionProvider>
          </SidebarProvider>
        </GoogleOAuthProvider>
        <Toaster
          position="top-center"
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
