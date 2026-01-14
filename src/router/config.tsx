import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const TripsPage = lazy(() => import('../pages/trips/page'));
const EarningsPage = lazy(() => import('../pages/earnings/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const RequestPage = lazy(() => import('../pages/request/page'));
const ActiveTripPage = lazy(() => import('../pages/active-trip/page'));
const TripCompletePage = lazy(() => import('../pages/trip-complete/page'));
const SupportPage = lazy(() => import('../pages/support/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/trips',
    element: <TripsPage />,
  },
  {
    path: '/earnings',
    element: <EarningsPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/request',
    element: <RequestPage />,
  },
  {
    path: '/active-trip',
    element: <ActiveTripPage />,
  },
  {
    path: '/trip-complete',
    element: <TripCompletePage />,
  },
  {
    path: '/support',
    element: <SupportPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
