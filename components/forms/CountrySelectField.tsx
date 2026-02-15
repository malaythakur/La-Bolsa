'use client';

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Controller, Control, FieldError } from "react-hook-form";
import countryList from "react-select-country-list";
import ReactCountryFlag from "react-country-flag";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";

type Props = {
    name: keyof SignUpFormData; // "country" in your form
    control: Control<SignUpFormData>;
    error?: FieldError;
    required?: boolean;
};

const CountrySelectField = ({ name, control, error, required = false }: Props) => {
    const countries = React.useMemo(() => countryList().getData(), []);
    const [search, setSearch] = React.useState("");

    // Filter + sort countries based on search input
    const filteredCountries = React.useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return countries
            .filter((c) => c.label.toLowerCase().includes(lowerSearch))
            .sort((a, b) => {
                const aStarts = a.label.toLowerCase().startsWith(lowerSearch);
                const bStarts = b.label.toLowerCase().startsWith(lowerSearch);
                return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
            });
    }, [search, countries]);

    return (
        <div className="space-y-2">
            <Label className="form-label">Country</Label>

            <Controller
                name={name}
                control={control}
                rules={{ required: required ? "Please select your country" : false }}
                render={({ field }) => {
                    const selectedCountry = countries.find((c) => c.value === field.value);

                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="select-trigger justify-between w-full"
                                >
                                    {selectedCountry ? (
                                        <div className="flex items-center gap-2">
                                            <ReactCountryFlag
                                                countryCode={selectedCountry.value}
                                                svg
                                                style={{ width: "1.2em", height: "1.2em" }}
                                            />
                                            {selectedCountry.label}
                                        </div>
                                    ) : (
                                        "Select country"
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search country..."
                                        value={search}
                                        onValueChange={setSearch}
                                    />
                                    <CommandEmpty>No country found.</CommandEmpty>

                                    <CommandGroup className="max-h-60 overflow-y-auto">
                                        {filteredCountries.map((country) => (
                                            <CommandItem
                                                key={country.value}
                                                value={country.label}
                                                onSelect={() => field.onChange(country.value)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ReactCountryFlag
                                                        countryCode={country.value}
                                                        svg
                                                        style={{ width: "1.2em", height: "1.2em" }}
                                                    />
                                                    {country.label}
                                                </div>
                                                {field.value === country.value && (
                                                    <Check className="ml-auto h-4 w-4" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />

            {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
    );
};

export default CountrySelectField;
