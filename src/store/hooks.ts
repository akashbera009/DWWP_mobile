/**
 * store/hooks.ts
 *
 * Always import useAppDispatch / useAppSelector from here.
 * Never use raw useDispatch / useSelector — no type safety.
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector