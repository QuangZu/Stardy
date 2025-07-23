<template>
  <div class="schedule-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading learning content...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadLearningData" class="retry-btn">Try Again</button>
    </div>

    <!-- Sidebar -->
    <Sidebar 
      :userName="userName" 
      :userLevel="userLevel" 
      currentPage="schedule"
      @logout="logout"
    />

    <!-- Main Content -->
    <div class="main-content">
      <header class="schedule-header">
        <div class="header-content">
          <h1 class="space-text-primary space-glow">Study Schedule</h1>
          <p class="space-text-secondary">Plan and organize your learning journey</p>
        </div>
        <div class="header-actions">
          <button @click="addNewEvent" class="space-button">
            <i class="fas fa-plus"></i> Add Event
          </button>
        </div>
      </header>

      <!-- Calendar View -->
      <div class="schedule-content">
        <!-- Calendar Header -->
        <div class="calendar-header space-card">
          <div class="calendar-nav">
            <button @click="previousMonth" class="nav-btn space-button">
              <i class="fas fa-chevron-left"></i>
            </button>
            <h2 class="space-text-primary">{{ currentMonthYear }}</h2>
            <button @click="nextMonth" class="nav-btn space-button">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="view-toggle">
            <button 
              v-for="view in views" 
              :key="view.value"
              @click="currentView = view.value"
              :class="['view-btn', 'space-button', { active: currentView === view.value }]"
            >
              <i :class="view.icon"></i> {{ view.label }}
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div v-if="currentView === 'month'" class="calendar-grid space-card">
          <!-- Days of Week Header -->
          <div class="calendar-days-header">
            <div v-for="day in daysOfWeek" :key="day" class="day-header space-text-secondary">
              {{ day }}
            </div>
          </div>
          
          <!-- Calendar Days -->
          <div class="calendar-days">
            <div 
              v-for="day in calendarDays" 
              :key="day.date"
              :class="['calendar-day', { 
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'has-events': day.events.length > 0
              }]"
              @click="selectDay(day)"
            >
              <span class="day-number space-text-primary">{{ day.day }}</span>
              <div class="day-events">
                <div 
                  v-for="event in day.events.slice(0, 2)" 
                  :key="event.id"
                  :class="['event-dot', `event-${event.type}`]"
                  :title="event.title"
                ></div>
                <span v-if="day.events.length > 2" class="more-events space-text-muted">
                  +{{ day.events.length - 2 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Week View -->
        <div v-else-if="currentView === 'week'" class="week-view space-card">
          <div class="week-header">
            <div v-for="day in weekDays" :key="day.date" class="week-day-header">
              <div class="day-name space-text-secondary">{{ day.dayName }}</div>
              <div class="day-date space-text-primary">{{ day.day }}</div>
            </div>
          </div>
          <div class="week-content">
            <div class="time-slots">
              <div v-for="hour in timeSlots" :key="hour" class="time-slot space-text-muted">
                {{ hour }}
              </div>
            </div>
            <div class="week-days">
              <div v-for="day in weekDays" :key="day.date" class="week-day">
                <div 
                  v-for="event in day.events" 
                  :key="event.id"
                  :class="['week-event', `event-${event.type}`]"
                  :style="getEventStyle(event)"
                  @click="editEvent(event)"
                >
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Day View -->
        <div v-else class="day-view space-card">
          <div class="day-header">
            <h3 class="space-text-primary">{{ selectedDayFormatted }}</h3>
          </div>
          <div class="day-events-list">
            <div 
              v-for="event in selectedDayEvents" 
              :key="event.id"
              :class="['day-event', `event-${event.type}`]"
              @click="editEvent(event)"
            >
              <div class="event-time space-text-secondary">{{ event.startTime }} - {{ event.endTime }}</div>
              <div class="event-details">
                <h4 class="event-title space-text-primary">{{ event.title }}</h4>
                <p class="event-description space-text-muted">{{ event.description }}</p>
                <div class="event-meta">
                  <span class="event-type space-text-secondary">
                    <i :class="getEventIcon(event.type)"></i> {{ event.type }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="selectedDayEvents.length === 0" class="no-events space-text-muted">
              <i class="fas fa-calendar-times"></i>
              <p>No events scheduled for this day</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <div v-if="showEventModal" class="modal-overlay" @click="closeModal">
      <div class="modal space-card" @click.stop>
        <div class="modal-header">
          <h3 class="space-text-primary">{{ editingEvent ? 'Edit Event' : 'Add New Event' }}</h3>
          <button @click="closeModal" class="close-btn space-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveEvent">
            <div class="form-group">
              <label class="space-text-secondary">Title</label>
              <input v-model="eventForm.title" type="text" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="space-text-secondary">Description</label>
              <textarea v-model="eventForm.description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="space-text-secondary">Date</label>
                <input v-model="eventForm.date" type="date" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="space-text-secondary">Type</label>
                <select v-model="eventForm.type" class="form-input" required>
                  <option value="study">Study Session</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="meeting">Meeting</option>
                  <option value="break">Break</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="space-text-secondary">Start Time</label>
                <input v-model="eventForm.startTime" type="time" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="space-text-secondary">End Time</label>
                <input v-model="eventForm.endTime" type="time" class="form-input" required>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="cancel-btn space-button">
                Cancel
              </button>
              <button v-if="editingEvent" type="button" @click="deleteEvent" class="delete-btn space-button">
                <i class="fas fa-trash"></i> Delete
              </button>
              <button type="submit" class="save-btn space-button">
                <i class="fas fa-save"></i> {{ editingEvent ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Schedule',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Student',
      userLevel: 1,
      currentDate: new Date(),
      selectedDate: new Date(),
      currentView: 'month',
      showEventModal: false,
      editingEvent: null,
      views: [
        { value: 'month', label: 'Month', icon: 'fas fa-calendar' },
        { value: 'week', label: 'Week', icon: 'fas fa-calendar-week' },
        { value: 'day', label: 'Day', icon: 'fas fa-calendar-day' }
      ],
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      timeSlots: [
        '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
      ],
      events: [
        {
          id: 1,
          title: 'Mathematics Study Session',
          description: 'Review calculus concepts',
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '11:00',
          type: 'study'
        },
        {
          id: 2,
          title: 'Physics Exam',
          description: 'Midterm examination',
          date: '2024-01-18',
          startTime: '14:00',
          endTime: '16:00',
          type: 'exam'
        },
        {
          id: 3,
          title: 'Chemistry Assignment',
          description: 'Lab report submission',
          date: '2024-01-20',
          startTime: '10:00',
          endTime: '12:00',
          type: 'assignment'
        }
      ],
      eventForm: {
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'study'
      }
    };
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const today = new Date();
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayEvents = this.events.filter(event => 
          event.date === date.toISOString().split('T')[0]
        );
        
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        });
      }
      
      return days;
    },
    weekDays() {
      const startOfWeek = new Date(this.selectedDate);
      startOfWeek.setDate(this.selectedDate.getDate() - this.selectedDate.getDay());
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const dayEvents = this.events.filter(event => 
          event.date === date.toISOString().split('T')[0]
        );
        
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          events: dayEvents
        });
      }
      
      return days;
    },
    selectedDayFormatted() {
      return this.selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    selectedDayEvents() {
      const dateStr = this.selectedDate.toISOString().split('T')[0];
      return this.events.filter(event => event.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
  },
  async mounted() {
    await this.loadUserData();
  },
  methods: {
    async loadUserData() {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userData = await getAccount(userId);
          this.userName = userData.username || 'Student';
          this.userLevel = userData.level || 1;
        }
      } catch (error) {
        console.warn('Could not load user data:', error);
      }
    },
    getParticleSize(index) {
      const sizes = ['particle-small', 'particle-medium', 'particle-large'];
      return sizes[index % sizes.length];
    },
    getParticleColor(index) {
      const colors = ['particle-blue', 'particle-purple', 'particle-cyan', 'particle-white'];
      return colors[index % colors.length];
    },
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    selectDay(day) {
      this.selectedDate = new Date(day.date);
      if (this.currentView === 'month') {
        this.currentView = 'day';
      }
    },
    addNewEvent() {
      this.editingEvent = null;
      this.eventForm = {
        title: '',
        description: '',
        date: this.selectedDate.toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        type: 'study'
      };
      this.showEventModal = true;
    },
    editEvent(event) {
      this.editingEvent = event;
      this.eventForm = { ...event };
      this.showEventModal = true;
    },
    closeModal() {
      this.showEventModal = false;
      this.editingEvent = null;
    },
    saveEvent() {
      if (this.editingEvent) {
        const index = this.events.findIndex(e => e.id === this.editingEvent.id);
        if (index !== -1) {
          this.events[index] = { ...this.eventForm, id: this.editingEvent.id };
        }
      } else {
        const newEvent = {
          ...this.eventForm,
          id: Date.now()
        };
        this.events.push(newEvent);
      }
      this.closeModal();
    },
    deleteEvent() {
      if (this.editingEvent) {
        this.events = this.events.filter(e => e.id !== this.editingEvent.id);
        this.closeModal();
      }
    },
    getEventStyle(event) {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      const startMinute = parseInt(event.startTime.split(':')[1]);
      const endMinute = parseInt(event.endTime.split(':')[1]);
      
      const top = ((startHour - 8) * 60 + startMinute) * (60 / 60); // 60px per hour
      const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) * (60 / 60);
      
      return {
        top: `${top}px`,
        height: `${height}px`
      };
    },
    getEventIcon(type) {
      const icons = {
        study: 'fas fa-book',
        exam: 'fas fa-file-alt',
        assignment: 'fas fa-tasks',
        meeting: 'fas fa-users',
        break: 'fas fa-coffee'
      };
      return icons[type] || 'fas fa-calendar';
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.schedule-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  font-size: 1.5rem;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-left: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.avatar {
  position: relative;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.avatar::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.user-profile:hover .avatar::before {
  opacity: 1;
}

.user-profile:hover .avatar {
  transform: scale(1.05);
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 3;
}

.user-profile:hover .avatar img {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.user-info {
  position: relative;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info {
  transform: translateX(2px);
}

.user-info h4 {
  color: white;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.8rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info p {
  color: rgba(255, 255, 255, 0.9);
}

.user-profile:active {
  transform: scale(0.98);
}

.user-profile:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.user-profile:hover .avatar {
  transform: scale(1.08);
}

.user-profile:hover .user-info h4 {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
}


.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  position: relative;
  z-index: 10;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  color: white;
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
} 

.header-content p {
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

/* Calendar Styles */
.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calendar-nav h2 {
  margin: 0;
  font-size: 1.5rem;
  min-width: 200px;
  text-align: center;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.view-btn.active {
  background: linear-gradient(135deg, rgba(135, 206, 250, 0.5), rgba(70, 130, 180, 0.5));
}

/* Calendar Grid */
.calendar-grid {
  padding: 1.5rem;
}

.calendar-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1rem;
}

.day-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.calendar-day {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  min-height: 100px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.calendar-day:hover {
  background: rgba(255, 255, 255, 0.1);
}

.calendar-day.today {
  background: rgba(135, 206, 250, 0.2);
  border: 2px solid rgba(135, 206, 250, 0.5);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.day-number {
  font-weight: 600;
  font-size: 1rem;
}

.day-events {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.event-study { background: #4CAF50; }
.event-exam { background: #F44336; }
.event-assignment { background: #FF9800; }
.event-meeting { background: #2196F3; }
.event-break { background: #9C27B0; }

.more-events {
  font-size: 0.7rem;
  margin-left: 4px;
}

/* Week View */
.week-view {
  padding: 1.5rem;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1rem;
}

.week-day-header {
  padding: 1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
}

.day-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.week-content {
  display: flex;
  gap: 1rem;
}

.time-slots {
  width: 80px;
  display: flex;
  flex-direction: column;
}

.time-slot {
  height: 60px;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.week-days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  position: relative;
}

.week-day {
  position: relative;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  z-index: 1;
}

.week-event.event-study { background: rgba(76, 175, 80, 0.8); }
.week-event.event-exam { background: rgba(244, 67, 54, 0.8); }
.week-event.event-assignment { background: rgba(255, 152, 0, 0.8); }
.week-event.event-meeting { background: rgba(33, 150, 243, 0.8); }
.week-event.event-break { background: rgba(156, 39, 176, 0.8); }

.event-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.event-time {
  font-size: 0.7rem;
  opacity: 0.9;
}

/* Day View */
.day-view {
  padding: 1.5rem;
}

.day-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-event {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.3s ease;
}

.day-event:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.day-event.event-study { border-left-color: #4CAF50; }
.day-event.event-exam { border-left-color: #F44336; }
.day-event.event-assignment { border-left-color: #FF9800; }
.day-event.event-meeting { border-left-color: #2196F3; }
.day-event.event-break { border-left-color: #9C27B0; }

.event-details {
  flex: 1;
}

.event-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.event-description {
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.event-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.no-events {
  text-align: center;
  padding: 3rem;
}

.no-events i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  padding: 0.5rem;
  border: none;
  cursor: pointer;
  border-radius: 50%;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: rgba(135, 206, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(135, 206, 250, 0.2);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
}

.delete-btn {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.3), rgba(211, 47, 47, 0.3));
  border-color: rgba(244, 67, 54, 0.5);
}

.save-btn {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(56, 142, 60, 0.3));
  border-color: rgba(76, 175, 80, 0.5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .view-toggle {
    width: 100%;
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}

</style>