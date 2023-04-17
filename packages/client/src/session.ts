/*
 * Copyright (c) 2021 Concurrent Technologies Corporation.
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ByteFrequencyProfileRequest,
  ByteFrequencyProfileResponse,
  ComputedFileSizeResponse,
  CountKind,
  CountRequest,
  CountResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  IntResponse,
  ObjectId,
  SaveSessionRequest,
  SaveSessionResponse,
  SearchRequest,
  SearchResponse,
  SegmentRequest,
  SegmentResponse,
  SessionCountResponse,
  SingleCount,
} from './omega_edit_pb'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { getClient } from './client'
import { getLogger } from './logger'
import { editSimple, IEditStats } from './change'
export {
  CountKind,
  CreateSessionResponse,
  EventSubscriptionRequest,
  SessionEventKind,
} from './omega_edit_pb'

/**
 * Create a file editing session from a file path
 * @param file_path file path, will be opened for read, to create an editing session with, or undefined if starting from
 * scratch
 * @param session_id_desired if defined, the session ID to assign to this session, if undefined a unique session ID will
 * be generated by the server
 * @return session ID, on success, or empty string if session creation was blocked (e.g., graceful shutdown)
 */
export function createSession(
  file_path: string = '',
  session_id_desired: string = ''
): Promise<CreateSessionResponse> {
  return new Promise<CreateSessionResponse>((resolve, reject) => {
    let request = new CreateSessionRequest()
    if (session_id_desired.length > 0)
      request.setSessionIdDesired(session_id_desired)
    if (file_path.length > 0) request.setFilePath(file_path)
    getLogger().debug({ fn: 'createSession', rqst: request.toObject() })
    getClient().createSession(request, (err, r: CreateSessionResponse) => {
      if (err) {
        getLogger().error({
          fn: 'createSession',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('createSession error: ' + err.message)
      }
      getLogger().debug({ fn: 'createSession', resp: r.toObject() })
      return resolve(r)
    })
  })
}

/**
 * Destroy the given session and all associated objects (changes, and viewports)
 * @param session_id session to destroy
 * @return session ID that was destroyed, on success
 */
export function destroySession(session_id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({ fn: 'destroySession', rqst: request.toObject() })
    getClient().destroySession(request, (err, r: ObjectId) => {
      if (err) {
        getLogger().error({
          fn: 'destroySession',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('destroySession error: ' + err.message)
      }
      getLogger().debug({ fn: 'destroySession', resp: r.toObject() })
      return resolve(r.getId())
    })
  })
}

/**
 * Save the given session (the edited file) to the given file path.  If the save file already exists, it can be
 * overwritten if overwrite is true.  If the file exists and overwrite is false, a new unique file name will be used as
 * determined by server.  If the file being edited is overwritten, the affected editing session will be reset.
 * @param session_id session to save
 * @param file_path file path to save to
 * @param overwrite set to true if overwriting an existing file is okay, and false otherwise
 * @return name of the saved file, on success
 */
export function saveSession(
  session_id: string,
  file_path: string,
  overwrite: boolean
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new SaveSessionRequest()
      .setSessionId(session_id)
      .setFilePath(file_path)
      .setAllowOverwrite(overwrite)
    getLogger().debug({ fn: 'saveSession', rqst: request.toObject() })
    getClient().saveSession(request, (err, r: SaveSessionResponse) => {
      if (err) {
        getLogger().error({
          fn: 'saveSession',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('saveSession error: ' + err.message)
      }
      getLogger().debug({ fn: 'saveSession', resp: r.toObject() })
      return resolve(r.getFilePath())
    })
  })
}

/**
 * Computed file size in bytes for a given session
 * @param session_id session to get the computed file size from
 * @return computed file size in bytes, on success
 */
export function getComputedFileSize(session_id: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({ fn: 'getComputedFileSize', rqst: request.toObject() })
    getClient().getComputedFileSize(
      request,
      (err, r: ComputedFileSizeResponse) => {
        if (err) {
          getLogger().error({
            fn: 'getComputedFileSize',
            err: {
              msg: err.message,
              details: err.details,
              code: err.code,
              stack: err.stack,
            },
          })
          return reject('getComputedFileSize error: ' + err.message)
        }
        getLogger().debug({ fn: 'getComputedFileSize', resp: r.toObject() })
        return resolve(r.getComputedFileSize())
      }
    )
  })
}

/**
 * Gets any number of counts for a given session concurrently
 * @param session_id session to get the counts from
 * @param kinds kinds of counts to get
 * @return array of counts with associated kinds, on success
 */
export function getCounts(
  session_id,
  kinds: CountKind[]
): Promise<SingleCount[]> {
  return new Promise<SingleCount[]>((resolve, reject) => {
    const request = new CountRequest()
      .setSessionId(session_id)
      .setKindList(kinds)
    getLogger().debug({ fn: 'getCounts', rqst: request.toObject() })
    getClient().getCount(request, (err, r: CountResponse) => {
      if (err) {
        getLogger().error({
          fn: 'getCounts',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('getCounts error: ' + err.message)
      }
      getLogger().debug({ fn: 'getCounts', resp: r.toObject() })
      return resolve(r.getCountsList())
    })
  })
}

/**
 * Pause data changes to the session
 * @param session_id session to pause changes to
 * @return session ID that has its changes paused, on success
 */
export function pauseSessionChanges(session_id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({ fn: 'pauseSessionChanges', rqst: request.toObject() })
    getClient().pauseSessionChanges(request, (err, r: ObjectId) => {
      if (err) {
        getLogger().error({
          fn: 'pauseSessionChanges',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('pauseSessionChanges error: ' + err.message)
      }
      getLogger().debug({ fn: 'pauseSessionChanges', resp: r.toObject() })
      return resolve(r.getId())
    })
  })
}

export function beginSessionTransaction(session_id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({
      fn: 'beginSessionTransaction',
      rqst: request.toObject(),
    })
    getClient().sessionBeginTransaction(request, (err, r: ObjectId) => {
      if (err) {
        getLogger().error({
          fn: 'beginSessionTransaction',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('beginSessionTransaction error: ' + err.message)
      }
      getLogger().debug({ fn: 'beginSessionTransaction', resp: r.toObject() })
      return resolve(r.getId())
    })
  })
}

export function endSessionTransaction(session_id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({ fn: 'endSessionTransaction', rqst: request.toObject() })
    getClient().sessionEndTransaction(request, (err, r: ObjectId) => {
      if (err) {
        getLogger().error({
          fn: 'endSessionTransaction',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('endSessionTransaction error: ' + err.message)
      }
      getLogger().debug({ fn: 'endSessionTransaction', resp: r.toObject() })
      return resolve(r.getId())
    })
  })
}

/**
 * Resume data changes on the previously paused session
 * @param session_id session to resume changes on
 * @return session ID that has its changes resumed, on success
 */
export function resumeSessionChanges(session_id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({ fn: 'resumeSessionChanges', rqst: request.toObject() })
    getClient().resumeSessionChanges(request, (err, r: ObjectId) => {
      if (err) {
        getLogger().error({
          fn: 'resumeSessionChanges',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('resumeSessionChanges error: ' + err.message)
      }
      getLogger().debug({ fn: 'resumeSessionChanges', resp: r.toObject() })
      return resolve(r.getId())
    })
  })
}

/**
 * Unsubscribe to session events
 * @param session_id session to unsubscribe
 * @return session ID that was unsubscribed, on success
 */
export function unsubscribeSession(session_id: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({ fn: 'unsubscribeSession', rqst: request.toObject() })
    getClient()
      .unsubscribeToSessionEvents(request, (err, r: ObjectId) => {
        if (err) {
          getLogger().error({
            fn: 'unsubscribeSession',
            err: {
              msg: err.message,
              details: err.details,
              code: err.code,
              stack: err.stack,
            },
          })
          return reject('unsubscribeSession error: ' + err.message)
        }
        getLogger().debug({ fn: 'unsubscribeSession', resp: r.toObject() })
        return resolve(r.getId())
      })
      .on('error', (err) => {
        // Call cancelled thrown when server is shutdown
        if (!err.message.includes('Call cancelled')) {
          throw err
        }
      })
  })
}

/**
 * Given a session and offset, return a copy of that data segment
 * @param session_id session to copy a segment of data from
 * @param offset session offset to begin copying data from
 * @param length number of bytes to copy
 * @return copy of the desired segment of data, on success
 */
export function getSegment(
  session_id: string,
  offset: number,
  length: number
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const request = new SegmentRequest()
      .setSessionId(session_id)
      .setOffset(offset)
      .setLength(length)
    getLogger().debug({ fn: 'getSegment', rqst: request.toObject() })
    getClient().getSegment(request, (err, r: SegmentResponse) => {
      if (err) {
        getLogger().error({
          fn: 'getSegment',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('getSegment error: ' + err.message)
      }
      getLogger().debug({ fn: 'getSegment', resp: r.toObject() })
      return resolve(r.getData_asU8())
    })
  })
}

/**
 * Gets the number of active editing sessions on the server
 * @return number of active sessions on the server, on success
 */
export function getSessionCount(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    getLogger().debug({ fn: 'getSessionCount' })
    getClient().getSessionCount(new Empty(), (err, r: SessionCountResponse) => {
      if (err) {
        getLogger().error({
          fn: 'getSessionCount',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('getSessionCount error: ' + err.message)
      }
      getLogger().debug({ fn: 'getSessionCount', resp: r.toObject() })
      return resolve(r.getCount())
    })
  })
}

/**
 * Notify changed viewports in the given session with a VIEWPORT_EVT_CHANGES event
 * @param session_id session to notify viewports with changes
 * @return number of viewports that were notified
 */
export function notifyChangedViewports(session_id: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const request = new ObjectId().setId(session_id)
    getLogger().debug({
      fn: 'notifyChangedViewports',
      rqst: request.toObject(),
    })
    getClient().notifyChangedViewports(request, (err, r: IntResponse) => {
      if (err) {
        getLogger().error({
          fn: 'notifyChangedViewports',
          err: {
            msg: err.message,
            details: err.details,
            code: err.code,
            stack: err.stack,
          },
        })
        return reject('notifyChangedViewports error: ' + err.message)
      }
      getLogger().debug({ fn: 'notifyChangedViewports', resp: r.toObject() })
      return resolve(r.getResponse())
    })
  })
}

/**
 * Given a session, offset and length, populate a byte frequency profile
 * @param session_id session to profile
 * @param offset where in the session to begin profiling
 * @param length number of bytes from the offset to stop profiling (if 0, it will profile to the end of the session)
 * @return array of size 256 (for the 8-bit bytes) with the values being the byte frequency in the given range, on
 * success
 */
export function profileSession(
  session_id: string,
  offset: number = 0,
  length: number = 0
): Promise<number[]> {
  return new Promise<number[]>((resolve, reject) => {
    let request = new ByteFrequencyProfileRequest()
      .setSessionId(session_id)
      .setOffset(offset)
    if (length > 0) {
      request.setLength(length)
    }
    getLogger().debug({ fn: 'profileSession', rqst: request.toObject() })
    getClient().getByteFrequencyProfile(
      request,
      (err, r: ByteFrequencyProfileResponse) => {
        if (err) {
          getLogger().error({
            fn: 'profileSession',
            err: {
              msg: err.message,
              details: err.details,
              code: err.code,
              stack: err.stack,
            },
          })
          return reject('profileSession error: ' + err.message)
        }
        getLogger().debug({ fn: 'profileSession', resp: r.toObject() })
        return resolve(r.getFrequencyList())
      }
    )
  })
}

/**
 * Given a computed profile, return the total number of bytes in the 7-bit ASCII range
 * @param profile computed profile from profileSession
 * @return total number of ASCII bytes found in the profile
 */
export function numAscii(profile: number[]): number {
  return profile.slice(0, 128).reduce((accumulator, current) => {
    return accumulator + current
  }, 0)
}

/**
 * Search a segment in a session for a given pattern and return an array of offsets where the pattern was found
 * @param session_id session to find the pattern in
 * @param pattern pattern to find
 * @param is_case_insensitive false for case-sensitive matching and true for case-insensitive matching
 * @param offset start searching at this offset within the session, or at the start of the session if undefined
 * @param length search from the starting offset within the session up to this many bytes, if set to zero or undefined,
 * it will search to the end of the session
 * @param limit if defined, limits the number of matches found to this amount
 * @return array of offsets where the pattern was found
 */
export function searchSession(
  session_id: string,
  pattern: string | Uint8Array,
  is_case_insensitive: boolean = false,
  offset: number = 0,
  length: number = 0,
  limit: number = 0
): Promise<number[]> {
  return new Promise<number[]>((resolve, reject) => {
    // make sure we have a pattern to search for
    if (pattern.length === 0) {
      getLogger().warn({ fn: 'searchSession', msg: 'empty pattern given' })
      return resolve([])
    }
    let request = new SearchRequest()
      .setSessionId(session_id)
      .setPattern(typeof pattern === 'string' ? Buffer.from(pattern) : pattern)
      .setIsCaseInsensitive(is_case_insensitive)
      .setOffset(offset)
    if (length > 0) {
      request.setLength(length)
    }
    if (limit > 0) {
      request.setLimit(limit)
    }
    getLogger().debug({ fn: 'searchSession', rqst: request.toObject() })
    getClient().searchSession(request, (err, r: SearchResponse) => {
      if (err) {
        console.log(err.message)
        return reject('searchSession error: ' + err.message)
      }
      getLogger().debug({ fn: 'searchSession', resp: r.toObject() })
      return resolve(r.getMatchOffsetList())
    })
  })
}

/**
 * Replace all found patterns in a segment in a session with the given replacement and return the number of replacements
 * done
 * @param session_id session to replace patterns in
 * @param pattern pattern to replace
 * @param replacement replacement
 * @param is_case_insensitive false for case-sensitive matching and true for case-insensitive matching
 * @param offset start searching at this offset within the session, or at the start of the session if undefined
 * @param length search from the starting offset within the session up to this many bytes, if set to zero or undefined,
 * it will search to the end of the session
 * @param limit if defined, limits the number of matches found to this amount
 * @param stats optional edit stats to update
 * @return number of replacements done
 * @remarks highly recommend pausing all viewport events using pauseViewportEvents before calling this function, then
 * resuming all viewport events with resumeViewportEvents after calling this function.  Since viewport events were
 * disabled during the changes, determine what viewports have changes by using the viewportHasChanges function and if so
 * refresh the ones that have changes.
 */
export async function replaceSession(
  session_id: string,
  pattern: string | Uint8Array,
  replacement: string | Uint8Array,
  is_case_insensitive: boolean = false,
  offset: number = 0,
  length: number = 0,
  limit: number = 0,
  stats?: IEditStats
): Promise<number> {
  const foundLocations = await searchSession(
    session_id,
    pattern,
    is_case_insensitive,
    offset,
    length,
    limit
  )
  const patternArray =
    typeof pattern == 'string' ? Buffer.from(pattern) : pattern
  const replacementArray =
    typeof replacement == 'string' ? Buffer.from(replacement) : replacement
  // do replacements starting with the highest offset to the lowest offset, so offset adjustments don't need to be made
  for (let i = foundLocations.length - 1; i >= 0; --i) {
    await editSimple(
      session_id,
      foundLocations[i],
      patternArray,
      replacementArray,
      stats
    )
  }
  return foundLocations.length
}

/**
 * Replace found patterns in a segment in session iteratively
 * @param session_id session to replace patterns in
 * @param pattern pattern to replace
 * @param replacement replacement
 * @param is_case_insensitive false for case-sensitive matching and true for case-insensitive matching
 * @param offset start searching at this offset within the session, or at the start of the session if undefined
 * @param length search from the starting offset within the session up to this many bytes, if set to zero or undefined,
 * it will search to the end of the session
 * @return true of a replacement took place (false otherwise), and the offset to use for the next iteration (or -1 if no
 * replacement took place)
 */
export async function replaceOneSession(
  session_id: string,
  pattern: string | Uint8Array,
  replacement: string | Uint8Array,
  is_case_insensitive: boolean = false,
  offset: number = 0,
  length: number = 0
): Promise<[boolean, number]> {
  const patternArray =
    typeof pattern == 'string' ? Buffer.from(pattern) : pattern
  const replacementArray =
    typeof replacement == 'string' ? Buffer.from(replacement) : replacement
  const foundLocations = await searchSession(
    session_id,
    patternArray,
    is_case_insensitive,
    offset,
    length,
    1
  )
  if (foundLocations.length > 0) {
    await editSimple(
      session_id,
      foundLocations[0],
      patternArray,
      replacementArray
    )
    // the next iteration offset should be at the end of this replacement
    return [true, foundLocations[0] + replacementArray.length]
  }
  return [false, -1]
}
