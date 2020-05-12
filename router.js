import React from 'react'
import Loadable from 'react-loadable'
import { HashRouter, Route, BrowserHistory, Redirect, Switch } from 'react-router-dom'

import LoadingPage from './components/LoadingPage/LoadingPage'
import SystemMenu from './components/SystemMenu/SystemMenu'

const Loading = () => <LoadingPage />
const Evaluate = Loadable({
  loader: () => import('./containers/InterPlan/Evaluate/Evaluate'),
  loading: Loading,
  delay: 0,
})
const NodeEvaluate = Loadable({
  loader: () => import('./containers/AreaPlan/AreaEvaluate/NodeEvaluate'),
  loading: Loading,
  delay: 0,
})
const AreaFlow = Loadable({
  loader: () => import('./containers/AreaPlan/AreaFlow/AreaFlow'),
  loading: Loading,
  delay: 0,
})
const AreaAllocation = Loadable({
  loader: () => import('./containers/AreaPlan/AreaAllocation/AreaAllocation'),
  loading: Loading,
  delay: 0,
})
const AreaCanalization = Loadable({
  loader: () => import('./containers/AreaPlan/AreaCanalization/AreaCanalization'),
  loading: Loading,
  delay: 0,
})
const AreaEvaluate = Loadable({
  loader: () => import('./containers/AreaPlan/AreaEvaluate/AreaEvaluate'),
  loading: Loading,
  delay: 0,
})
const AreaSingal = Loadable({
  loader: () => import('./containers/AreaPlan/AreaSingal/AreaSingal'),
  loading: Loading,
  delay: 0,
})
const TestGreenWave = Loadable({
  loader: () => import('./TestGreenWave'),
  loading: Loading,
  delay: 0,
})
const Trafficmanage = Loadable({
  loader: () => import('./containers/TrafficManage/TrafficManage/TrafficManage'),
  loading: Loading,
  delay: 0,
})
const Trafficassess = Loadable({
  loader: () => import('./containers/TrafficManage/TrafficAssess/TrafficAssess'),
  loading: Loading,
  delay: 0,
})
const Trafficsystem = Loadable({
  loader: () => import('./containers/TrafficSystem/TrafficSystem'),
  loading: Loading,
  delay: 0,
})
const Jurisdiction = Loadable({
  loader: () => import('./containers/TrafficSystem/Jurisdiction'),
  loading: Loading,
  delay: 0,
})
const Usergroup = Loadable({
  loader: () => import('./containers/TrafficSystem/Usergroup'),
  loading: Loading,
  delay: 0,
})
const Journal = Loadable({
  loader: () => import('./containers/TrafficSystem/Journal'),
  loading: Loading,
  delay: 0,
})
const TrafficMenu = Loadable({
  loader: () => import('./containers/TrafficSystem/TrafficMenu'),
  loading: Loading,
  delay: 0,
})
const Canalization = Loadable({
  loader: () => import('./containers/InterPlan/Canalization/Canalization'),
  loading: Loading,
  delay: 0,
})
const Singal = Loadable({
  loader: () => import('./containers/InterPlan/Singal/Singal'),
  loading: Loading,
  delay: 0,
})
const Trafficanalysis = Loadable({
  loader: () => import('./containers/TrafficAnalysis/TrafficAnalysis'),
  loading: Loading,
  delay: 0,
})
const Flow = Loadable({
  loader: () => import('./containers/InterPlan/Flow/Flow'),
  loading: Loading,
  delay: 0,
})
const Trafficdatas = Loadable({
  loader: () => import('./containers/TrafficDatas/TrafficDatas/TrafficDatas'),
  loading: Loading,
  delay: 0,
})
const Trafficareadatas = Loadable({
  loader: () => import('./containers/TrafficDatas/TrafficAreaDatas/TrafficAreaDatas'),
  loading: Loading,
  delay: 0,
})
const Trafficarea = Loadable({
  loader: () => import('./containers/TrafficArea/TrafficArea/TrafficArea'),
  loading: Loading,
  delay: 0,
})
const Infomanage = Loadable({
  loader: () => import('./containers/TrafficArea/InfoManage/InfoManage'),
  loading: Loading,
  delay: 0,
})
const Promanage = Loadable({
  loader: () => import('./containers/TrafficArea/ProManage/ProManage'),
  loading: Loading,
  delay: 0,
})
const Header = Loadable({
  loader: () => import('./containers/Header/Header'),
  loading: Loading,
  delay: 0,
})
const Login = Loadable({
  loader: () => import('./containers/Login/Login'),
  loading: Loading,
  delay: 0,
})
const Entrance = Loadable({
  loader: () => import('./containers/Entrance/Entrance'),
  loading: Loading,
  delay: 0,
})
const Entrances = Loadable({
  loader: () => import('./containers/Entrance/Entrances'),
  loading: Loading,
  delay: 0,
})
const Roadtraffic = Loadable({
  loader: () => import('./containers/InterPlan/Roadtraffic/Roadtraffic'),
  loading: Loading,
  delay: 0,
})
const Informationmana = Loadable({
  loader: () => import('./containers/InterPlan/Informationmana/Informationmana'),
  loading: Loading,
  delay: 0,
})
const Projectmana = Loadable({
  loader: () => import('./containers/InterPlan/Projectmana/Projectmana'),
  loading: Loading,
  delay: 0,
})
const Allocation = Loadable({
  loader: () => import('./containers/InterPlan/Allocation/Allocation'),
  loading: Loading,
  delay: 0,
})
const Facilitiesmana = Loadable({
  loader: () => import('./containers/InterPlan/Facilitiesmana/Facilitiesmana'),
  loading: Loading,
  delay: 0,
})