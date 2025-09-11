<?php

namespace App\Notifications;

use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmployeeSubmittedForReview extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Employee $employee)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Employee Submitted for Review')
            ->greeting('Hello!')
            ->line('An employee has been submitted for onboarding review:')
            ->line('Name: '.$this->employee->name)
            ->line('Employee Code: '.$this->employee->employee_code)
            ->action('Open HR Overview', url('/hr'))
            ->line('Please review uploaded documents and request hard copies.');
    }
}

