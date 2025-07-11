/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as ProjectRouteImport } from './routes/project'
import { Route as LoginRouteImport } from './routes/login'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ProjectProjectIdRouteImport } from './routes/project.$projectId'

const ProjectRoute = ProjectRouteImport.update({
  id: '/project',
  path: '/project',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const DashboardRoute = DashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ProjectProjectIdRoute = ProjectProjectIdRouteImport.update({
  id: '/$projectId',
  path: '/$projectId',
  getParentRoute: () => ProjectRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/login': typeof LoginRoute
  '/project': typeof ProjectRouteWithChildren
  '/project/$projectId': typeof ProjectProjectIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/login': typeof LoginRoute
  '/project': typeof ProjectRouteWithChildren
  '/project/$projectId': typeof ProjectProjectIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/dashboard': typeof DashboardRoute
  '/login': typeof LoginRoute
  '/project': typeof ProjectRouteWithChildren
  '/project/$projectId': typeof ProjectProjectIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/dashboard' | '/login' | '/project' | '/project/$projectId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/dashboard' | '/login' | '/project' | '/project/$projectId'
  id:
    | '__root__'
    | '/'
    | '/dashboard'
    | '/login'
    | '/project'
    | '/project/$projectId'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DashboardRoute: typeof DashboardRoute
  LoginRoute: typeof LoginRoute
  ProjectRoute: typeof ProjectRouteWithChildren
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/project': {
      id: '/project'
      path: '/project'
      fullPath: '/project'
      preLoaderRoute: typeof ProjectRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/dashboard': {
      id: '/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/project/$projectId': {
      id: '/project/$projectId'
      path: '/$projectId'
      fullPath: '/project/$projectId'
      preLoaderRoute: typeof ProjectProjectIdRouteImport
      parentRoute: typeof ProjectRoute
    }
  }
}

interface ProjectRouteChildren {
  ProjectProjectIdRoute: typeof ProjectProjectIdRoute
}

const ProjectRouteChildren: ProjectRouteChildren = {
  ProjectProjectIdRoute: ProjectProjectIdRoute,
}

const ProjectRouteWithChildren =
  ProjectRoute._addFileChildren(ProjectRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DashboardRoute: DashboardRoute,
  LoginRoute: LoginRoute,
  ProjectRoute: ProjectRouteWithChildren,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
