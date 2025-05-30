"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { addActivity } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface AddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityAdded?: () => void
}

export function AddActivityDialog({ 
  open, 
  onOpenChange,
  onActivityAdded 
}: AddActivityDialogProps) {
  const [activityType, setActivityType] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [durationUnit, setDurationUnit] = useState<string>("minutes")
  const [distance, setDistance] = useState<string>("")
  const [distanceUnit, setDistanceUnit] = useState<string>("km")
  const [calories, setCalories] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!activityType || !duration || !calories) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format duration with unit
      const formattedDuration = `${duration} ${durationUnit}`
      
      // Format distance with unit if provided
      const formattedDistance = distance ? `${distance} ${distanceUnit}` : null

      const newActivity = {
        type: activityType,
        duration: formattedDuration,
        distance: formattedDistance,
        calories: parseInt(calories),
        date: date.toISOString()
      }

      await addActivity(newActivity)
      
      // Reset form
      setActivityType("")
      setDuration("")
      setDurationUnit("minutes")
      setDistance("")
      setDistanceUnit("km")
      setCalories("")
      setDate(new Date())
      
      toast({
        title: "Activity added",
        description: "Your activity has been recorded successfully"
      })
      
      // Call the callback to refresh activities
      if (onActivityAdded) {
        onActivityAdded()
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add activity:", error)
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogDescription>Record a new fitness activity to track your progress.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity-type" className="text-right">
              Type
            </Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activity-type" className="col-span-3">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Cycling">Cycling</SelectItem>
                <SelectItem value="Swimming">Swimming</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="Weight Training">Weight Training</SelectItem>
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input 
                id="duration" 
                type="number" 
                placeholder="30" 
                className="w-20" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <Select value={durationUnit} onValueChange={setDurationUnit}>
                <SelectTrigger id="duration-unit" className="w-32">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distance" className="text-right">
              Distance
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input 
                id="distance" 
                type="number" 
                placeholder="5" 
                className="w-20" 
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
              <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                <SelectTrigger id="distance-unit" className="w-32">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="mi">Miles</SelectItem>
                  <SelectItem value="m">Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calories" className="text-right">
              Calories
            </Label>
            <Input 
              id="calories" 
              type="number" 
              placeholder="300" 
              className="col-span-3" 
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Activity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


