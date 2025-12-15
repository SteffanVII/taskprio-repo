import './App.css'
import { createHashRouter, RouteObject } from 'react-router'
import LoginRoute from './routes/public/login'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthLayout from './routes/layouts/authLayout'
import PrivateLayout from './services/private/PrivateLayout'
import ProjectPage from './routes/private/project/projectPage'
import MainPage from './routes/private/mainPage'
import TaskboardPage from './routes/private/project/taskboard/taskboardPage'
import AcceptRoute from './routes/public/accept'
import { ThemeProvider } from './lib/utils/themeProvider'
import ProjectSettingsPage from './routes/private/project/settings/projectSettingsPage'
import ProfilePage from './routes/private/profile/profilePage'
import TaskTodoPage from './routes/private/taskTodo/taskTodoPage'
import MousePositionProvider from './lib/utils/mousePositionProvider'
import WorkspaceSettingsPage from './routes/private/workspace/settings/workspaceSettingsPage'
import { Toaster } from './components/ui/sonner'
import RouterProviderCustom from './components/others/shared/RouterProviderCustom'
import ElectronCustomTitlebar from './components/others/shared/ElectronCustomTitlebar'
import { useElectronStore_isElectron } from './stores/electron'
import TaskTodoPageOverlay from './routes/private/taskTodo/taskTodoPageOverlay'
import { ETaskTodoPageUIMode, useTaskTodoPageStore_uIMode } from './stores/taskTodoPage'

const queryClient = new QueryClient()

createHashRouter

const routeObjects : RouteObject[] = [
	{
		path : "/",
		element : <AuthLayout/>,
		children : [
			{
				path : "login",
				element : <LoginRoute />
			},
			{
				path : "accept",
				element : <AcceptRoute/>
			},
			{
				path : "p",
				element : <PrivateLayout/>,
				children : [
					{
						path : "w/:workspace_id?",
						element : <MainPage/>,
						children : [
							{
								path : "d/:project_id?",
								element : <ProjectPage/>,
								children : [
									{
										path : "t/:task_board_id?/:task_id?",
										element : <TaskboardPage/>
									},
									{
										path : "project_settings",
										element : <ProjectSettingsPage/>
									}
								]
							},
							{
								path : "tt",
								element : <TaskTodoPage/>
							},
							{
								path : "workspace_settings",
								element : <WorkspaceSettingsPage/>
							}
						]
					},
					{
						path : "task_todo_overlay/:workspace_id",
						element : <TaskTodoPageOverlay/>
					},
					{
						path : "profile",
						element : <ProfilePage/>
					}
				]
			}
		]
	}
]

// const routerBrowser = createBrowserRouter(routeObjects)
// const routerHash = createHashRouter(routeObjects)

function App() {

	const isElectron = useElectronStore_isElectron()
	const taskTodoPageUIMode = useTaskTodoPageStore_uIMode()

	return (
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme' >
			{
				(isElectron && (taskTodoPageUIMode !== ETaskTodoPageUIMode.OVERLAY && taskTodoPageUIMode !== ETaskTodoPageUIMode.WIDGET)) &&
				<ElectronCustomTitlebar/>
			}
			<MousePositionProvider>
				<QueryClientProvider client={queryClient}>
					<RouterProviderCustom routeObjects={routeObjects} />
				</QueryClientProvider>
			</MousePositionProvider>
			<Toaster
				position="top-center"
			/>
		</ThemeProvider>
	)
}

export default App
