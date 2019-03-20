const sports = [
    {
        name: 'Gym',
        icon: 'dumbbell',
        hasDistance: false,
    },
    {
        name: 'Cardio',
        icon: 'heart',
        hasDistance: true,
    },
    {
        name: 'Walking',
        icon: 'walking',
        hasDistance: true,
    },
    {
        name: 'Running',
        icon: 'running',
        hasDistance: true,
    },
    {
        name: 'Swimming',
        icon: 'swimmer',
        hasDistance: true,
    },
    {
        name: 'Team sports',
        icon: 'basketball-ball',
        hasDistance: false,
    },
    {
        name: 'Cycling',
        icon: 'bicycle',
        hasDistance: true,
    },
    {
        name: 'Skating',
        icon: 'skating',
        hasDistance: true,
    },
    {
        name: 'Skiing',
        icon: 'skiing-nordic',
        hasDistance: true,
    },
    {
        name: 'Other',
        icon: 'star',
        hasDistance: true,
    }
]

module.exports.sports = sports;

// TODO: hasDistance value has not been used anywhere yet. The point of it is
// that when user adds an activity, distance fields are not visible if hasDistance
// is false. Some sport types (like gym) need no distance.

/* Font awsome icons:
<i class="fas fa-basketball-ball"></i>
<i class="fas fa-skiing-nordic"></i>
<i class="fas fa-skating"></i>
<i class="fas fa-running"></i>
<i class="fas fa-swimmer"></i>
<i class="fas fa-walking"></i>
<i class="fas fa-bicycle"></i>
<i class="fas fa-heart"></i>
<i class="fas fa-dumbbell"></i>
<i class="fas fa-star"></i>
*/