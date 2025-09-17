import React from 'react';
import Icon from '../../../components/AppIcon';

const MonthlyCalendar = ({ 
  currentDate, 
  events, 
  onDateClick, 
  onEventClick,
  selectedDate 
}) => {
  const today = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar?.setDate(startOfCalendar?.getDate() - startOfCalendar?.getDay());

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const calendarDays = [];

  // Generate calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startOfCalendar);
    date?.setDate(startOfCalendar?.getDate() + i);
    calendarDays?.push(date);
  }

  const getEventsForDate = (date) => {
    const dateStr = date?.toISOString()?.split('T')?.[0];
    return events?.filter(event => {
      const eventDate = new Date(event.date)?.toISOString()?.split('T')?.[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date) => {
    return date?.toDateString() === today?.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date?.getMonth() === currentDate?.getMonth();
  };

  const isSelected = (date) => {
    return selectedDate && date?.toDateString() === selectedDate?.toDateString();
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-error';
      case 'completed':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Week days header */}
      <div className="grid grid-cols-7 bg-muted">
        {weekDays?.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays?.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`min-h-[120px] p-2 border-r border-b border-border last:border-r-0 cursor-pointer transition-colors duration-150 ${
                isCurrentMonthDate
                  ? 'bg-background hover:bg-muted/50' :'bg-muted/30 text-muted-foreground'
              } ${
                isSelectedDate ? 'ring-2 ring-primary ring-inset' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isTodayDate
                      ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center'
                      : isCurrentMonthDate
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {date?.getDate()}
                </span>
                {dayEvents?.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {dayEvents?.length}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents?.slice(0, 3)?.map((event) => (
                  <div
                    key={event?.id}
                    onClick={(e) => {
                      e?.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity duration-150 ${getEventStatusColor(
                      event?.status
                    )}`}
                    title={`${event?.title} - ${event?.venue}`}
                  >
                    <div className="truncate">{event?.title}</div>
                    <div className="text-xs opacity-75 truncate">
                      {event?.time} - {event?.venue}
                    </div>
                  </div>
                ))}
                {dayEvents?.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{dayEvents?.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;