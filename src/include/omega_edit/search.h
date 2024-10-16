/**********************************************************************************************************************
 * Copyright (c) 2021-2022 Concurrent Technologies Corporation.                                                       *
 *                                                                                                                    *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance     *
 * with the License.  You may obtain a copy of the License at                                                         *
 *                                                                                                                    *
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                     *
 *                                                                                                                    *
 * Unless required by applicable law or agreed to in writing, software is distributed under the License is            *
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or                   *
 * implied.  See the License for the specific language governing permissions and limitations under the License.       *
 *                                                                                                                    *
 **********************************************************************************************************************/

#ifndef OMEGA_EDIT_SEARCH_H
#define OMEGA_EDIT_SEARCH_H

#include "byte.h"
#include "fwd_defs.h"

#ifdef __cplusplus
#include <cstdint>
extern "C" {
#else
#include <stdint.h>
#endif

/**
 * Opaque search context
 */
typedef struct omega_search_context_t omega_search_context_t;

/**
 * Create a search context
 * @param session_ptr session to find patterns in
 * @param pattern pointer to the pattern to find (as a sequence of bytes)
 * @param pattern_length length of the pattern (if 0, strlen will be used to calculate the length of null-terminated
 * bytes)
 * @param session_offset start searching at this offset within the session
 * @param session_length search from the starting offset within the session up to this many bytes, if set to zero, it
 * will track the computed session length
 * @param case_insensitive zero for case sensitive match and non-zero otherwise
 * @return search context
 */
omega_search_context_t *omega_search_create_context_bytes(const omega_session_t *session_ptr,
                                                          const omega_byte_t *pattern, int64_t pattern_length,
                                                          int64_t session_offset, int64_t session_length,
                                                          int case_insensitive);

/**
 * Create a search context
 * @param session_ptr session to find patterns in
 * @param pattern pointer to the pattern to find (as a C string)
 * @param pattern_length length of the pattern (if 0, strlen will be used to calculate the length of null-terminated
 * bytes)
 * @param session_offset start searching at this offset within the session
 * @param session_length search from the starting offset within the session up to this many bytes, if set to zero, it
 * will track the computed session length
 * @param case_insensitive zero for case sensitive matching and non-zero otherwise
 * @return search context
 */
inline omega_search_context_t *omega_search_create_context(const omega_session_t *session_ptr, const char *pattern,
                                                           int64_t pattern_length, int64_t session_offset,
                                                           int64_t session_length, int case_insensitive) {
    return omega_search_create_context_bytes(session_ptr, (const omega_byte_t *) pattern, pattern_length,
                                             session_offset, session_length, case_insensitive);
}

/**
 * Given a search context, get the most recent search offset
 * @param search_context_ptr search context to get the most recent search offset from
 * @return the most recent search offset, if the search offset is equal to the session length, then no match was found
 */
int64_t omega_search_context_get_offset(const omega_search_context_t *search_context_ptr);

/**
 * Given a search context, get the pattern length
 * @param search_context_ptr search context to get the pattern length from
 * @return the pattern length offset
 */
int64_t omega_search_context_get_length(const omega_search_context_t *search_context_ptr);

/**
 * Given a search context, find the next match
 * @param search_context_ptr search context to find the next match in
 * @param advance_context advance the internal search context offset by this many bytes
 * @return non-zero if a match is found, zero otherwise
 */
int omega_search_next_match(omega_search_context_t *search_context_ptr, int64_t advance_context);

/**
 * Destroy the given search context
 * @param search_context_ptr search context to destroy
 */
void omega_search_destroy_context(omega_search_context_t *search_context_ptr);

#ifdef __cplusplus
}
#endif

#endif//OMEGA_EDIT_SEARCH_H
