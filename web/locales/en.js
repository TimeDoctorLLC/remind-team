export default {
    translation: {
        globals: {
            appName: 'RemindTeam.com',
            appNameApp: '$t(globals.appName)',
            appDescription: 'Easily remind your company team members of their goals',
            appSupportEmail: 'support@remindteam.com',
            signOut: 'Sign Out',
            signIn: 'Sign In',
            signUp: 'Sign Up',
            or: 'or'
        },

        notifications: {
            welcome: {
                title: 'Welcome to RemindTeam.com',
                message: 'You\'ll now get reminders from your team.\nFeedback at $t(globals.appSupportEmail)'
            },
            reminder: {
                title: 'Here are your goals:',
                message: '{{goal}}'
            }
        },
        
        enroll: {
            email: 'Email',
            password: 'Password',
            name: 'Name'
        },
        
        csv: {
            goal: 'goal{{index}}',
            email: 'email',
            doNotRemoveHeader: 'do not remove this header row',
            exEmail: 'someone@replace.me',
            exGoal1: 'this is just an example goal',
            exGoal2: 'other goals are optional'
        },
        
        dashboard: {
            youCurrentlyHaveMembers: 'You currently have {{count}} active team member',
            youCurrentlyHaveMembers_plural: 'You currently have {{count}} active team members',
            downloadCsv: 'Download CSV',
            uploadCsv: 'Upload CSV',
            reminderInterval: 'Reminder Interval',
            email: 'Email',
            status: 'Status',
            invitationLink: 'Invitation Link',
            statusDone: 'Done!',
            statusWaiting: 'Waiting Registration',
            statusInviteNotSent: 'Invite Not Sent',
            copy: 'Copy',
            notSaved: 'Not Saved',
            noTeamMembers: '<strong>No team members!</strong><br />Saving will cause $t(globals.appName) to stop sending notifications for all of the previously registered team members.',
            save: 'Save',
            refresh: 'Refresh',
            toGetStarted: 'To get started <strong>download this template CSV</strong> and use it to <strong>add all of your team members</strong>, their email and the top 1-5 things you want to remind them of. You can enter a maximum of five items per person.',
            inviteLinkCopied: 'Invite link copied to clipboard!',
            unableToCopy: 'Unable to copy to clipboard!'
        },

        invites: {
            youHaveBeenInvited: 'You\'ve been invited to $t(globals.appName)!',
            frequentlySendsYou: 'This app sends you daily reminders of whatever you want to focus on.',
            toAcceptTheInvitation: '<strong>To accept the invitation, please allow the request for notifications.</strong> This app only works in Google Chrome.',

            notificationsBlocked: 'Notifications for Goal Reminder are blocked. The invitation won\'t be accepted if notifications are not allowed.',
            pleaseAllowNotifications: 'Waiting for you to allow notifications',
            enablingNotifications: 'Enabling notifications...',
            youAreAllSet: 'You\'re all set! Thank You!',
            errorConfirmingInvitation: 'Oops! There was an error while confiming the invitation.'
        },

        nav: {
            toggleNavigation: 'Toggle navigation'
        },
        
        errors: {
            goHome: 'Go Home',
            '404': {
                title: 'Oops! 404, page not found.',
                message: 'Sorry about that, but the page you are looking for is not available anymore.'
            },
            '401': {
                title: 'Resource requires authorized access.', 
                message: 'Your authentication might have expired or be invalid.<br />If you think something is broken, report a problem.'
            },
            '500': {
                title: 'Looks like we\'re having some server issues.', 
                message: 'Go back to the previous page and try again.<br />If you think something is broken, report a problem.' 
            }
        }
    }
}