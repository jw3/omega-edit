/**********************************************************************************************************************
 * Copyright (c) 2021-2022 Concurrent Technologies Corporation.                                                       *
 *                                                                                                                    *
 * Licensed under the Apache License, Version 2.0 (the "License");                                                    *
 * you may not use this file except in compliance with the License.                                                   *
 * You may obtain a copy of the License at                                                                            *
 *                                                                                                                    *
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                     *
 *                                                                                                                    *
 * Unless required by applicable law or agreed to in writing, software                                                *
 * distributed under the License is distributed on an "AS IS" BASIS,                                                  *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                           *
 * See the License for the specific language governing permissions and                                                *
 * limitations under the License.                                                                                     *
 **********************************************************************************************************************/

#ifndef OMEGA_EDIT_SCOPED_PTR_H
#define OMEGA_EDIT_SCOPED_PTR_H

#ifdef __cplusplus

#include <functional>
#include <memory>

/**
 * Scoped smart pointer with custom delete function suitable for managing omega edit pointers that are eligible for
 * destruction
 */
template<typename T>
using omega_scoped_ptr = std::unique_ptr<T, std::function<void(T *)>>;

#endif//__cplusplus

#endif//OMEGA_EDIT_SCOPED_PTR_H
