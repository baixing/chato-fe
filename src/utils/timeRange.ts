// 时间格式 2023-03-20 12:55:42
import dayjs from 'dayjs'

export function getTodayRange() {
  const dateStr = dayjs().format('YYYY-MM-DD')
  return {
    begin_time: _getDateBeginStr(dateStr),
    end_time: _getDateEndStr(dateStr)
  }
}

export function getLatestNDaysRange(n) {
  const begin_time = _getDateBeginStr(_getBeforeNDayStr(n))
  const { end_time } = getTodayRange()
  return {
    begin_time,
    end_time
  }
}

// 日期跨度类型：today | week | month
export function getDateRangeParamsByType(type) {
  switch (type) {
    case 'today':
      return getTodayRange()
    case 'week':
      return getLatestNDaysRange(7)
    case 'month':
      return getLatestNDaysRange(30)
  }
}

export function getSpecifiedDateSinceNowDay(specifiedDate: string) {
  return dayjs().endOf('day').diff(dayjs(specifiedDate).startOf('day'), 'day')
}

function _getBeforeNDayStr(n) {
  if (n === 0) return dayjs().format('YYYY-MM-DD')
  return dayjs()
    .subtract(n - 1, 'day')
    .format('YYYY-MM-DD')
}
function _getDateBeginStr(dateStr) {
  return dateStr + ' ' + '00:00:00'
}
function _getDateEndStr(dateStr) {
  return dateStr + ' ' + '23:59:59'
}
